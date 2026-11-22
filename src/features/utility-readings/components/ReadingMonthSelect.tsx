import dayjs from "dayjs";
import React, { useMemo } from "react";
import { Select } from "@/components/form/Select";
import {
  getCurrentReadingMonth,
  getReadingMonthOptions,
} from "@/features/utility-readings/utils";

interface ReadingMonthSelectProps {
  id?: string;
  value: string;
  onChange: (month: string) => void;
  className?: string;
}

export const ReadingMonthSelect: React.FC<ReadingMonthSelectProps> = ({
  id,
  value,
  onChange,
  className,
}) => {
  const currentMonth = getCurrentReadingMonth();
  const options = useMemo(
    () => getReadingMonthOptions(dayjs.utc(`${currentMonth}-01`)),
    [currentMonth],
  );

  return (
    <Select
      id={id}
      className={className}
      options={options}
      placeholder="Select month"
      value={value}
      onChange={(month) => month && onChange(month)}
    />
  );
};
