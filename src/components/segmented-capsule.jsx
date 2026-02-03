import {cn} from "../lib/utils.js";

export default function SegmentedCapsule({
                                             color,
                                             className,
                                             fill
                                         }) {
    const dynamicStyle = fill ? {backgroundColor: fill} : {};
    return (
        <div className={cn("flex flex-col gap-[1px] w-[3px]", className)}>
            {/* Top Segment: Rounded Top */}
            <div className={cn("w-[3px] h-[3px] rounded-t-full", color)} style={dynamicStyle}/>

            {/* Middle Segment: Square */}
            <div className={cn("w-[3px] h-[3px]", color)}  style={dynamicStyle}/>

            {/* Bottom Segment: Rounded Bottom */}
            <div className={cn("w-[3px] h-[3px] rounded-b-full", color)}  style={dynamicStyle}/>
        </div>
    );
}