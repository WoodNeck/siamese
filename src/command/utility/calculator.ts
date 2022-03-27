/* eslint-disable max-classes-per-file */
import Discord, { MessageActionRow, MessageButton, MessageButtonStyleResolvable, MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import Command from "~/core/Command";
import * as COLOR from "~/const/color";
import * as EMOJI from "~/const/emoji";
import { BUTTON_STYLE } from "~/const/discord";
import { CALCULATOR } from "~/const/command/utility";
import Cooldown from "~/core/Cooldown";
import { block } from "~/util/markdown";

export default new Command({
  name: CALCULATOR.CMD,
  description: CALCULATOR.DESC,
  sendTyping: false,
  slashData: new SlashCommandBuilder()
    .setName(CALCULATOR.CMD)
    .setDescription(CALCULATOR.DESC),
  cooldown: Cooldown.PER_USER(30),
  execute: async ctx => {
    const { bot, author } = ctx;
    const display = new Display();
    const expression = new Expression();

    display.draw(expression, expression);

    const buttons: MathButton[][] = [
      [new ReciprocalButton(), new SquareButton(), new SqrtButton(), new ModuloButton(), new DeleteButton()],
      [new NumberButton(7), new NumberButton(8), new NumberButton(9), new DivideButton(), new ClearButton()],
      [new NumberButton(4), new NumberButton(5), new NumberButton(6), new MultiplyButton(), new ClearEntryButton()],
      [new NumberButton(1), new NumberButton(2), new NumberButton(3), new MinusButton(), new PlusMinusButton()],
      [new NumberButton(0), new DoubleZeroButton(), new FractionButton(), new PlusButton(), new EqualButton()]
    ];

    const rows = buttons.map(row => {
      return new MessageActionRow().addComponents(
        ...row.map(btn => {
          return new MessageButton()
            .setCustomId(btn.customID)
            .setLabel(btn.label)
            .setStyle(btn.style);
        })
      );
    });

    const buttonMap = new Map<string, MathButton>();

    buttons.forEach(row => {
      row.forEach(btn => {
        buttonMap.set(btn.customID, btn);
      });
    });

    const calculatorMsg = await bot.send(ctx, {
      embeds: [display.embed],
      components: rows,
      fetchReply: true
    }) as Discord.Message;

    const collector = calculatorMsg.createMessageComponentCollector({
      filter: interaction => interaction.user.id === author.id,
      time: 9 * 60 * 1000 // 9 min
    });

    collector.on("collect", async interaction => {
      const btn = buttonMap.get(interaction.customId)!;
      const prevExpression = expression.clone();

      btn.onPressed(expression);
      display.draw(expression, prevExpression, btn);

      await interaction.update({
        embeds: [display.embed]
      }).catch(() => void 0);
    });
  }
});

class Display {
  public readonly maxWidth = 38;
  public readonly embed: MessageEmbed;

  public constructor() {
    const displayEmbed = new MessageEmbed();

    displayEmbed.setColor(COLOR.BOT);

    this.embed = displayEmbed;
  }

  public draw(expression: Expression, prevExpression: Expression, operator: MathButton | null = null): void {
    const exprStrings = this._parseExpressionAsString(expression, prevExpression, operator);

    this.embed.setDescription(block(exprStrings.join("\n")));
  }

  private _parseExpressionAsString(expression: Expression, prevExpression: Expression, operator: MathButton | null): string[] {
    const exprStrings: string[] = [];

    if (operator) {
      exprStrings.push(...operator.format(expression, prevExpression));
    } else {
      exprStrings.push(`${expression.operand1}`);
    }

    const maxWidth = exprStrings.reduce((max, str) => {
      return Math.max(max, str.length);
    }, this.maxWidth);

    return exprStrings.map(str => this._fitToWidth(str, maxWidth));
  }

  private _fitToWidth(expr: string, maxWidth: number) {
    return `${EMOJI.CURSOR}${EMOJI.FIGURE_SPACE}${EMOJI.FIGURE_SPACE.repeat(maxWidth - expr.length)}${expr}`;
  }
}

class Expression {
  private _operator: BinaryOperatorButton | null;
  private _operand1: number = 0;
  private _operand2: number = 0;
  private _fraction: number = 0;
  private _inputActive: boolean = false;

  public get operator() { return this._operator; }
  public get operand1() { return this._operand1; }
  public get operand2() { return this._operand2; }
  public get fraction() { return this._fraction; }
  public get hasFraction() { return this._fraction > 0; }
  public get hasOperand2() { return this._operator && (this._inputActive || this._operand2 !== 0); }
  public get inputActive() { return this._inputActive; }

  public get currentOperand() { return this._operator ? this._operand2 : this._operand1; }
  public set currentOperand(val: number) {
    if (this._operator) {
      this._operand2 = val;
    } else {
      this._operand1 = val;
    }

    this._inputActive = true;
  }

  public get currentOperandAsString() {
    if (!this.hasFraction) return this.currentOperand.toString();

    return this.currentOperand.toFixed(this._fraction - 1);
  }

  public clone() {
    const cloned = new Expression();

    cloned._operator = this._operator;
    cloned._operand1 = this._operand1;
    cloned._operand2 = this._operand2;
    cloned._fraction = this._fraction;
    cloned._inputActive = this._inputActive;

    return cloned;
  }

  public setOperator(btn: BinaryOperatorButton) {
    this._operator = btn;
    this._fraction = 0;
    this._inputActive = false;
  }

  public enableFraction() {
    if (this.hasFraction) return;

    this._fraction = 1;
  }

  public increaseFraction() {
    this._fraction += 1;
  }

  public decreaseFraction() {
    this._fraction -= 1;
  }

  public clear() {
    this._operand1 = 0;
    this._operand2 = 0;
    this._operator = null;
    this._fraction = 0;
    this._inputActive = false;
  }

  public clearEntry() {
    this._operand2 = 0;
    this._fraction = 0;
    this._inputActive = false;
  }

  public deactivate() {
    this._inputActive = false;
  }

  public calculate() {
    if (!this._operator) return;

    this._operand1 = this._operator.calculate(this);
    this._operator = null;
    this.clearEntry();
  }
}

abstract class MathButton {
  public abstract customID: string;
  public abstract label: string;
  public abstract style: MessageButtonStyleResolvable;
  public abstract onPressed(expression: Expression): void;
  public calculate(expression: Expression): number { return expression.currentOperand; }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public format(expression: Expression, prevExpression: Expression): string[] {
    if (expression.operator) {
      return expression.operator.format(expression);
    } else {
      return [expression.currentOperandAsString];
    }
  }
}

abstract class BinaryOperatorButton extends MathButton {
  public readonly style = BUTTON_STYLE.PRIMARY;
  public onPressed(expression: Expression): void {
    if (expression.operator) {
      expression.calculate();
    }

    expression.setOperator(this);
  }

  public format(expression: Expression): string[] {
    return [
      `${expression.operand1} ${this.label}`,
      expression.hasOperand2 ? expression.currentOperandAsString : ""
    ];
  }
}

class ReciprocalButton extends MathButton {
  public readonly customID = "reci";
  public readonly label = "¹⁄ₓ";
  public readonly style = BUTTON_STYLE.PRIMARY;
  public onPressed(expression: Expression): void {
    expression.currentOperand = this.calculate(expression);
    expression.deactivate();
  }

  public format(expression: Expression, prevExpression: Expression): string[] {
    if (expression.operator) {
      return expression.operator.format(expression);
    } else {
      const prevVal = prevExpression.currentOperand;
      return [`1 / ${prevVal}`, `${expression.currentOperand}`];
    }
  }

  public calculate(expression: Expression): number {
    return 1 / expression.currentOperand;
  }
}

class SquareButton extends MathButton {
  public readonly customID = "sqr";
  public readonly label = "x²";
  public readonly style = BUTTON_STYLE.PRIMARY;
  public onPressed(expression: Expression): void {
    expression.currentOperand = this.calculate(expression);
    expression.deactivate();
  }

  public format(expression: Expression, prevExpression: Expression): string[] {
    if (expression.operator) {
      return expression.operator.format(expression);
    } else {
      const prevVal = prevExpression.currentOperand;
      return [`(${prevVal})²`, `${expression.currentOperand}`];
    }
  }

  public calculate(expression: Expression): number {
    return expression.currentOperand ** 2;
  }
}

class SqrtButton extends MathButton {
  public readonly customID = "sqrt";
  public readonly label = "√";
  public readonly style = BUTTON_STYLE.PRIMARY;
  public onPressed(expression: Expression): void {
    expression.currentOperand = this.calculate(expression);
    expression.deactivate();
  }

  public format(expression: Expression, prevExpression: Expression): string[] {
    if (expression.operator) {
      return expression.operator.format(expression);
    } else {
      const prevVal = prevExpression.currentOperand;
      return [`√(${prevVal})`, `${expression.currentOperand}`];
    }
  }

  public calculate(expression: Expression): number {
    return Math.sqrt(expression.currentOperand);
  }
}

class NumberButton extends MathButton {
  public readonly customID: string;
  public readonly label: string;
  public readonly style = BUTTON_STYLE.SECONDARY;
  private _num: number;

  public constructor(num: number) {
    super();
    this._num = num;

    this.customID = num.toString();
    this.label = num.toString();
  }

  public onPressed(expression: Expression): void {
    if (!expression.inputActive) {
      if (!expression.operator && expression.operand1 !== 0) {
        expression.clear();
      } else if (expression.operator && expression.operand2 !== 0) {
        expression.clearEntry();
      }
    }

    if (expression.hasFraction) {
      expression.currentOperand = expression.currentOperand + this._num * (10 ** (-expression.fraction));
      expression.increaseFraction();
    } else {
      expression.currentOperand = expression.currentOperand * 10 + this._num;
    }
  }
}

class DoubleZeroButton extends MathButton {
  public readonly customID = "00";
  public readonly label = "00";
  public readonly style = BUTTON_STYLE.SECONDARY;
  public onPressed(expression: Expression): void {
    if (expression.hasFraction) {
      expression.increaseFraction();
      expression.increaseFraction();
    } else {
      expression.currentOperand = expression.currentOperand * 100;
    }
  }
}

class DivideButton extends BinaryOperatorButton {
  public readonly customID = "div";
  public readonly label = "÷";

  public calculate(expression: Expression): number {
    return expression.hasOperand2
      ? expression.operand1 / expression.operand2
      : expression.operand1;
  }
}

class MultiplyButton extends BinaryOperatorButton {
  public readonly customID = "mul";
  public readonly label = "×";

  public calculate(expression: Expression): number {
    return expression.hasOperand2
      ? expression.operand1 * expression.operand2
      : expression.operand1;
  }
}

class MinusButton extends BinaryOperatorButton {
  public readonly customID = "min";
  public readonly label = "-";

  public calculate(expression: Expression): number {
    return expression.hasOperand2
      ? expression.operand1 - expression.operand2
      : expression.operand1;
  }
}

class PlusButton extends BinaryOperatorButton {
  public readonly customID = "plus";
  public readonly label = "+";

  public calculate(expression: Expression): number {
    return expression.hasOperand2
      ? expression.operand1 + expression.operand2
      : expression.operand1;
  }
}

class ModuloButton extends BinaryOperatorButton {
  public readonly customID = "mod";
  public readonly label = "%";

  public calculate(expression: Expression): number {
    return expression.hasOperand2
      ? expression.operand1 % expression.operand2
      : expression.operand1;
  }
}

class DeleteButton extends MathButton {
  public readonly customID = "del";
  public readonly label = "DEL";
  public readonly style = BUTTON_STYLE.SECONDARY;

  public onPressed(expression: Expression): void {
    if (!expression.inputActive) return;

    if (expression.hasFraction) {
      const fractionMultipler = 10 ** (expression.fraction - 2);
      expression.currentOperand = Math.floor(expression.currentOperand * fractionMultipler) / fractionMultipler;
      expression.decreaseFraction();
      if (expression.fraction === 1) {
        expression.decreaseFraction();
      }
    } else {
      expression.currentOperand = Math.floor(expression.currentOperand / 10);
    }
  }
}

class ClearButton extends MathButton {
  public readonly customID = "c";
  public readonly label = "C";
  public readonly style = BUTTON_STYLE.DANGER;
  public onPressed(expression: Expression): void {
    expression.clear();
  }
}

class ClearEntryButton extends MathButton {
  public readonly customID = "ce";
  public readonly label = "CE";
  public readonly style = BUTTON_STYLE.DANGER;
  public onPressed(expression: Expression): void {
    if (expression.operator) {
      expression.clearEntry();
    } else {
      expression.clear();
    }
  }
}

class PlusMinusButton extends MathButton {
  public readonly customID = "pm";
  public readonly label = "±";
  public readonly style = BUTTON_STYLE.SECONDARY;
  public onPressed(expression: Expression): void {
    expression.currentOperand = -expression.currentOperand;
  }
}

class EqualButton extends MathButton {
  public readonly customID = "eq";
  public readonly label = "=";
  public readonly style = BUTTON_STYLE.SUCCESS;
  public onPressed(expression: Expression): void {
    expression.calculate();
  }

  public format(expression: Expression, prevExpression: Expression): string[] {
    if (prevExpression.operator) {
      return [`${prevExpression.operand1} ${prevExpression.operator.label} ${prevExpression.operand2} =`, `${expression.currentOperand}`];
    } else {
      return [`${expression.currentOperand} =`, `${expression.currentOperand}`];
    }
  }
}

class FractionButton extends MathButton {
  public readonly customID = "fr";
  public readonly label = ".";
  public readonly style = BUTTON_STYLE.SECONDARY;
  public onPressed(expression: Expression): void {
    expression.enableFraction();
  }
}
