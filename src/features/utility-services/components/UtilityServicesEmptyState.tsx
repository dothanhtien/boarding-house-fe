import React from "react";
import { Plus } from "lucide-react";
import Button from "@/components/ui/button/Button";
import {
  UTILITY_SERVICE_PRESETS,
  type UtilityServicePreset,
} from "@/features/utility-services/constants";
import { UtilityTypeIcon } from "./UtilityTypeIcon";

interface UtilityServicesEmptyStateProps {
  onAdd: (preset?: UtilityServicePreset) => void;
}

export const UtilityServicesEmptyState: React.FC<
  UtilityServicesEmptyStateProps
> = ({ onAdd }) => (
  <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center dark:border-gray-700">
    <h5 className="text-base font-semibold text-gray-800 dark:text-white/90">
      No utility services yet
    </h5>
    <p className="mt-1 max-w-md text-sm text-gray-500 dark:text-gray-400">
      Set up the services this property charges for, like electricity and water.
      Start from a common one or add your own.
    </p>

    <div className="mt-5 flex flex-wrap justify-center gap-2">
      {UTILITY_SERVICE_PRESETS.map((preset) => (
        <button
          key={preset.type}
          type="button"
          onClick={() => onAdd(preset)}
          className="hover:border-brand-500 hover:text-brand-500 inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition dark:border-gray-700 dark:text-gray-300"
        >
          <UtilityTypeIcon type={preset.type} className="h-4 w-4" />
          {preset.name}
        </button>
      ))}
    </div>

    <Button
      type="button"
      size="sm"
      variant="outline"
      className="mt-4"
      startIcon={<Plus className="h-4 w-4" aria-hidden />}
      onClick={() => onAdd()}
    >
      Custom service
    </Button>
  </div>
);
