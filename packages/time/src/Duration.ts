import { FORMAT } from "./const";

class Duration {
  /**
   * 밀리초를 받아 `"X일 X시간 X분 X초"`의 형태로 문자열을 반환
   */
  public static format(milisec: number): string {
    // 예외 케이스
    if (milisec === 0) return FORMAT.SECONDS(0);

    let totalSeconds = milisec / 1000;
    const days = Math.floor(totalSeconds / 86400);
    totalSeconds %= 86400;
    const hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);

    const times: string[] = [];

    if (days > 0) {
      times.push(FORMAT.DAYS(days));
    }
    if (hours > 0) {
      times.push(FORMAT.HOURS(hours));
    }
    if (minutes > 0) {
      times.push(FORMAT.MINUTES(minutes));
    }
    if (seconds > 0) {
      times.push(FORMAT.SECONDS(seconds));
    }

    return times.join(" ");
  }
}

export default Duration;
