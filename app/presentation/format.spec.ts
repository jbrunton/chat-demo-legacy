import { formatTime } from "./format";

describe("#formatTimestamp", () => {
  const now = new Date('2022-02-02T21:22:23.234Z');

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("returns only the time if the date is today", () => {
    const time = new Date('2022-02-02T13:14:15.123Z');
    expect(formatTime(time)).toEqual('13:14:15');
  });

  it("returns 'Yesterday' if the date is yesterday", () => {
    const time = new Date('2022-02-01T13:14:15.123Z');
    expect(formatTime(time)).toEqual('Yesterday, 13:14:15');
  });

  it("returns only the date if the years are the same", () => {
    const time = new Date('2022-01-01T13:14:15.123Z');
    expect(formatTime(time)).toEqual('1 Jan, 13:14:15');
  });

  it("returns the full date if the years are not the same", () => {
    const time = new Date('2021-01-01T13:14:15.123Z');
    expect(formatTime(time)).toEqual('1 Jan 2021, 13:14:15');
  });
});
