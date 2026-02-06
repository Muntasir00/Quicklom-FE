import * as React from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { Checkbox } from "@components/ui/checkbox";
import { Button } from "@components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@components/ui/command";

/**
 * Controlled MultiSelect
 * props:
 * - value: string[]
 * - onChange: (next: string[]) => void
 * - options: {value,label}[]
 * - placeholder?: string
 * - maxLabelCount?: number
 */
export default function MultiSelect({
                                        value = [],
                                        onChange,
                                        options = [],
                                        placeholder = "Select options",
                                        maxLabelCount = 2,
                                    }) {
    const selected = React.useMemo(
        () => options.filter((o) => value.includes(o.value)),
        [options, value]
    );

    const label = React.useMemo(() => {
        if (selected.length === 0) return placeholder;
        if (selected.length <= maxLabelCount) return selected.map((s) => s.label).join(", ");
        return `${selected.length} option selected`;
    }, [selected, placeholder, maxLabelCount]);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 text-left text-[13px] text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                    <span className={selected.length ? "truncate" : "text-slate-400"}>{label}</span>
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <div className="flex items-center gap-2 border-b px-3 py-2">
                        <Search className="h-4 w-4 text-slate-400" />
                        <CommandInput placeholder="Search" className="h-8 text-[13px]" />
                    </div>

                    <CommandEmpty className="p-3 text-sm text-slate-500">No results.</CommandEmpty>

                    <CommandGroup className="max-h-[240px] overflow-auto p-1">
                        {options.map((opt) => {
                            const checked = value.includes(opt.value);
                            return (
                                <CommandItem
                                    key={opt.value}
                                    value={opt.label}
                                    onSelect={() => {
                                        const next = checked
                                            ? value.filter((v) => v !== opt.value)
                                            : [...value, opt.value];
                                        onChange?.(next);
                                    }}
                                    className="flex items-center gap-2 rounded-md"
                                >
                                    <Checkbox checked={checked} className="h-4 w-4" />
                                    <span className="text-[13px]">{opt.label}</span>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>

                    {value.length > 0 ? (
                        <div className="flex items-center justify-between gap-2 border-t p-2">
                            <div className="flex flex-wrap gap-1">
                                {selected.slice(0, 3).map((s) => (
                                    <span
                                        key={s.value}
                                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700"
                                    >
                    {s.label}
                                        <button
                                            type="button"
                                            className="rounded hover:bg-slate-200"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                onChange?.(value.filter((v) => v !== s.value));
                                            }}
                                        >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                                ))}
                                {selected.length > 3 ? (
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-700">
                    +{selected.length - 3}
                  </span>
                                ) : null}
                            </div>

                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-[12px]"
                                onClick={() => onChange?.([])}
                            >
                                Clear
                            </Button>
                        </div>
                    ) : null}
                </Command>
            </PopoverContent>
        </Popover>
    );
}
