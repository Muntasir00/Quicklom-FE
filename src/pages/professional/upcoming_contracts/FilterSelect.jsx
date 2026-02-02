import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@components/ui/select";

export default function FilterSelect({ placeholder }) {
    return (
        <Select>
            <SelectTrigger className="h-12 min-w-[140px] bg-white border-slate-100 rounded-lg text-slate-500 focus:ring-blue-500/10">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="rounded-lg">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
        </Select>
    );
}