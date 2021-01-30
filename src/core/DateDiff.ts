class DateDiff {
  private _diff: Date;

  public constructor(end: Date, start: Date) {
    this._diff = new Date(end.getTime() - start.getTime());
  }

  public get years() {
    return this._diff.getUTCFullYear() - 1970;
  }

  public get weeks() {
    return (((this._diff.getTime() / 60000) / 60) / 24) / 7;
  }

  public get days() {
    return (((this._diff.getTime() / 60000) / 60) / 24);
  }

  public get hours() {
    return ((this._diff.getTime() / 60000) / 60);
  }

  public get minutes() {
    return (this._diff.getTime() / 60000);
  }
}

export default DateDiff;
