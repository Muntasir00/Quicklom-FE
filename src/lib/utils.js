import {clsx} from "clsx";
import {twMerge} from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

// export const getPageTitle = (path) => {
//     const pathWithoutRole = path.replace(/^\/(professional|institute)(\/|$)/, '$2') || '/';
//     return PAGE_TITLES[pathWithoutRole] ?? null;
// };

export const getCurrentDate = () => {
    const now = new Date();
    return {
        weekday: now.toLocaleDateString('en-US', {weekday: 'long'}),
        formattedDate: now.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    };
};