import DatePicker from 'react-datepicker';

type TimeRangePickerProps = {
  label: string;
  startTime: Date | null;
  endTime: Date | null;
  onStartTimeChange: (date: Date | null) => void;
  onEndTimeChange: (date: Date | null) => void;
};

/**
 * Shared time-range picker used by both the Create Batch and Create Session
 * forms so the time-selection UI is pixel-identical everywhere:
 *  - two react-datepicker time-only inputs in a 2-col grid
 *  - 30-minute intervals
 *  - 12-hour format with AM/PM ("h:mm aa")
 * Each start/end value remains independently selectable.
 */
export function TimeRangePicker({
  label,
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
}: TimeRangePickerProps) {
  return (
    <div>
      <label className="text-fg block text-sm font-medium">{label}</label>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <DatePicker
          selected={startTime}
          onChange={(date: Date | null) => onStartTimeChange(date)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          dateFormat="h:mm aa"
          placeholderText="Start Time"
          className="w-full rounded-lg border px-3 py-2"
          popperClassName="react-datepicker-popper"
          autoComplete="off"
        />
        <DatePicker
          selected={endTime}
          onChange={(date: Date | null) => onEndTimeChange(date)}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={30}
          dateFormat="h:mm aa"
          placeholderText="End Time"
          className="w-full rounded-lg border px-3 py-2"
          popperClassName="react-datepicker-popper"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
