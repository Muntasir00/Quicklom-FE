import React, {useState, useMemo} from "react";
import {useContractForm} from "@hooks/institute/contracts/useContractForm";
import {cleanContractName} from "@utils/StringUtils";
import {ChevronRight, Check} from "lucide-react";
import {Button} from "@components/ui/button.jsx";

const CATEGORY_CONFIG = {
    "Dental Care": {icon: "fas fa-tooth", color: "#17a2b8", bgColor: "#e8f4f8", order: 1},
    "Pharmacy": {icon: "fas fa-pills", color: "#28a745", bgColor: "#e8f5e9", order: 2},
    "Nursing and Home Care": {icon: "fas fa-hand-holding-medical", color: "#dc3545", bgColor: "#fce4ec", order: 3},
    "General Practice": {icon: "fas fa-stethoscope", color: "#6f42c1", bgColor: "#f3e5f5", order: 4},
    "General Medicine": {icon: "fas fa-stethoscope", color: "#6f42c1", bgColor: "#f3e5f5", order: 4},
};

const DEFAULT_CATEGORY_CONFIG = {icon: "fas fa-file-medical", color: "#6c757d", bgColor: "#f8f9fa", order: 99};

const Form = ({setSelectedContract, setCurrentStep, contractTypes}) => {
    const [activeCategory, setActiveCategory] = useState(null);

    const {
        register,
        handleSubmit,
        watch, // এখন এটি এরর দিবে না
        errors,
        onSubmit,
        FORM_ID,
    } = useContractForm({
        setSelectedContract,
        contractTypes,
        setCurrentStep,
    });

    // বর্তমানে সিলেক্টেড ভ্যালুটি রিয়েল-টাইমে পাওয়ার জন্য
    const selectedContractValue = watch("contract_category");

    const groupedContractTypes = useMemo(() => {
        if (!contractTypes || !Array.isArray(contractTypes)) return {};
        const grouped = contractTypes.reduce((acc, type) => {
            const category = type?.industry || "Other";
            if (!acc[category]) acc[category] = [];
            acc[category].push(type);
            return acc;
        }, {});

        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            const orderA = CATEGORY_CONFIG[a]?.order || DEFAULT_CATEGORY_CONFIG.order;
            const orderB = CATEGORY_CONFIG[b]?.order || DEFAULT_CATEGORY_CONFIG.order;
            return orderA - orderB;
        });

        const sortedGrouped = {};
        sortedCategories.forEach(cat => {
            sortedGrouped[cat] = grouped[cat];
        });
        return sortedGrouped;
    }, [contractTypes]);

    useMemo(() => {
        const categories = Object.keys(groupedContractTypes);
        if (categories.length > 0 && !activeCategory) setActiveCategory(categories[0]);
    }, [groupedContractTypes, activeCategory]);

    const getCategoryConfig = (category) => CATEGORY_CONFIG[category] || DEFAULT_CATEGORY_CONFIG;

    const categories = Object.keys(groupedContractTypes);
    const activeTypes = groupedContractTypes[activeCategory] || [];

    return (
        <form id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-8">
                {contractTypes && Array.isArray(contractTypes) && contractTypes.length > 0 ? (
                    <>
                        {/* 1. Category Tabs */}
                        <div className="flex justify-center flex-wrap gap-3">
                            <div className="inline-flex p-1 bg-white border border-gray-100 rounded-2xl shadow-sm">
                                {categories.map((category) => {
                                    const config = getCategoryConfig(category);
                                    const isActive = activeCategory === category;
                                    const count = groupedContractTypes[category]?.length || 0;

                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setActiveCategory(category)}
                                            className={`flex items-center gap-3 px-5 py-2.5 !rounded-xl transition-all duration-300 font-bold text-sm
                                                ${isActive ? "bg-[#EBF5FF] text-[#2D8FE3] border border-[#BDD7ED]" : "bg-transparent text-gray-500 border border-transparent hover:bg-gray-50"}
                                            `}
                                        >
                                            <i className={`${config.icon} text-base`}></i>
                                            <span>{category}</span>
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[10px] border ${isActive ? "bg-white border-[#BDD7ED] text-[#2D8FE3]" : "bg-gray-100 border-gray-200 text-gray-400"}`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 2. Contract Types Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTypes.map((type) => {
                                const typeValue = cleanContractName(type?.contract_name ?? "");
                                // চেক করা হচ্ছে এটি সিলেক্টেড কি না
                                const isSelected = selectedContractValue === typeValue;
                                console.log(type)

                                return (
                                    <div key={type?.id} className="relative group">
                                        <input
                                            type="radio"
                                            className="peer hidden"
                                            id={`contract-type-${type?.id}`}
                                            value={typeValue}
                                            {...register("contract_category")}
                                        />

                                        <label
                                            htmlFor={`contract-type-${type?.id}`}
                                            className={`relative block flex flex-col gap-6 shadow-sm overflow-hidden transition-all duration-200 cursor-pointer rounded-xl border border-[#BDD7ED] py-0
                                                ${isSelected
                                                ? "ring-2 ring-blue-500 bg-blue-50 shadow-lg -translate-y-1"
                                                : "bg-white hover:shadow-lg hover:-translate-y-1"}
                                            `}
                                        >
                                            <div
                                                className="p-8 flex flex-col items-center justify-center min-h-[300px] space-y-6 bg-gradient-to-b from-[#F3F9FE] to-[#EAF5FE] backdrop-blur-[8px]">
                                                {/* Title */}
                                                <h3 className="text-[#2A394B] font-light text-2xl leading-tight tracking-[0.005em] !mb-0 text-center">
                                                    {type?.contract_name}
                                                </h3>

                                                {/* Badge and Icon */}
                                                <div className="flex justify-center flex-wrap items-center gap-2 mt-2">
                                                    {/*<div className="flex items-center gap-[6px] px-5 py-3 rounded-[8px] border border-[#BDD7ED] bg-[#FBFBFB] text-[#374151] text-sm font-medium">*/}
                                                    {/*    {type?.contract_duration_type || "Temporary Contract"}*/}
                                                    {/*</div>*/}

                                                    <Button
                                                        variant={isSelected ? "ghost" : "outline"}
                                                        className="flex items-center gap-[6px] px-2 py-3 !rounded-[8px] border border-[#BDD7ED] bg-[#FBFBFB] text-[#374151]"
                                                    >
                                                        {type?.contract_duration_type || "Temporary Contract"}
                                                    </Button>

                                                    <Button
                                                        variant={isSelected ? "ghost" : "outline"}
                                                        className="flex items-center justify-center gap-[6px] !rounded-[8px] border border-[#BDD7ED] bg-[#FBFBFB]"
                                                    >
                                                        <ChevronRight
                                                            className="text-[#2A394B] h-4 w-4 transition-transform group-hover:translate-x-1"/>
                                                    </Button>

                                                    {/*<div className="flex items-center justify-center w-10 h-10 rounded-[8px] border border-[#BDD7ED] bg-[#FBFBFB]">*/}
                                                    {/*    <ChevronRight size={18} className="text-[#2A394B] transition-transform group-hover:translate-x-1" />*/}
                                                    {/*</div>*/}
                                                </div>

                                                {/* Selected Indicator (Blue Circle with Check) */}
                                                {isSelected && (
                                                    <div
                                                        className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                                        <div
                                                            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
                                                            <Check className="h-5 w-5 text-white" strokeWidth={3}/>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-medium">No contract types available.</p>
                    </div>
                )}

                {/* Error handling */}
                {errors?.contract_category && (
                    <div
                        className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2">
                        <i className="fas fa-exclamation-circle"></i>
                        {errors.contract_category.message}
                    </div>
                )}
            </div>
        </form>
    );
};

export default Form;