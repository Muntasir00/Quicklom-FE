import React from 'react';
import {Label} from "@components/ui/label";
import {Checkbox} from "@components/ui/checkbox";

const PositionSoughtSection = ({
                                   positionRows,
                                   watch,
                                   setValue,
                                   register,
                                   errors,
                                   positions,
                                   professionalCategories
                               }) => {
    return (
        <div className="w-full space-y-6 sm:space-y-8 my-4 sm:my-6">
            {positionRows?.length > 0 &&
                positionRows.map((row, index) => {
                    const selectedCategoryId = watch(`position_soughts.${index}.professional_category_id`);
                    const selectedPositions = watch(`position_soughts.${index}.position_ids`, []);
                    const specialistDentistPosition = positions?.find(p => p.name === "Specialist Dentist");

                    const showSpecialistRole =
                        specialistDentistPosition &&
                        Array.isArray(selectedPositions) &&
                        selectedPositions.length > 0 &&
                        selectedPositions.some(posId => Number(posId) === Number(specialistDentistPosition.id));

                    const categoryPositionsForRow = (positions ?? []).filter(
                        item => Number(item.professional_category_id) === Number(selectedCategoryId)
                    );

                    // Clear specialist role logic
                    React.useEffect(() => {
                        if (!showSpecialistRole) {
                            setValue(`position_soughts.${index}.specialist_dentist_role`, "");
                        }
                    }, [showSpecialistRole, index, setValue]);

                    return (
                        <div
                            key={row.id}
                            className="relative border border-slate-200 rounded-lg p-4 sm:p-6 pt-7 sm:pt-8 bg-white"
                        >
                            {/* Top Label (Legend style) */}
                            <span
                                className="absolute -top-3 left-4 bg-white px-2 text-[13px] sm:text-[15px] text-slate-400 font-normal">
                Position Sought
              </span>

                            <div className="grid grid-cols-12 gap-4 sm:gap-8 items-start">
                                {/* Left Side: Professional Category */}
                                <div className="col-span-12 md:col-span-5 space-y-2">
                                    <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                        Professional Category
                                    </Label>

                                    <div className="relative">
                                        <select
                                            className={`flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${
                                                errors?.position_soughts?.[index]?.professional_category_id ? 'border-red-500' : 'border-slate-200'
                                            }`}
                                            {...register(`position_soughts.${index}.professional_category_id`)}
                                            disabled
                                        >
                                            <option value="">Select category</option>
                                            {Array.isArray(professionalCategories) && professionalCategories.map(category => (
                                                <option key={category.id} value={category.id}>{category.name}</option>
                                            ))}
                                        </select>
                                        {/* নিচে একটি কাস্টম আইকন যোগ করা হয়েছে কারণ appearance-none দিলে ডিফল্ট অ্যারো চলে যায় */}
                                        <div
                                            className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                                            <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg"
                                                 fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                      d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </div>
                                    </div>

                                    {errors?.position_soughts?.[index]?.professional_category_id && (
                                        <p className="text-xs text-red-500 mt-1">{errors.position_soughts[index].professional_category_id.message}</p>
                                    )}
                                </div>

                                {/* Right Side: Position Sought Options */}
                                <div className="col-span-12 md:col-span-7 space-y-3">
                                    <Label className="text-[14px] sm:text-[15px] font-medium text-slate-600">
                                        Position Sought
                                    </Label>

                                    <div
                                        className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 sm:gap-y-4 gap-x-2 border border-[#E5E7EB] bg-[#FBFBFB] px-3 sm:px-[14px] py-3 sm:py-[10px] rounded-lg">
                                        {categoryPositionsForRow.map((position) => {
                                            const isChecked = selectedPositions?.includes(String(position.id)) || selectedPositions?.includes(Number(position.id));

                                            return (
                                                <div
                                                    key={position.id}
                                                    className="flex items-start sm:items-center space-x-2 gap-2"
                                                >
                                                    <Checkbox
                                                        id={`pos-${index}-${position.id}`}
                                                        checked={isChecked}
                                                        onCheckedChange={(checked) => {
                                                            // Image e check box thakleo apnar logic single selection maintain korche
                                                            if (checked) {
                                                                setValue(`position_soughts.${index}.position_ids`, [String(position.id)]);
                                                            } else {
                                                                setValue(`position_soughts.${index}.position_ids`, []);
                                                            }
                                                        }}
                                                        className="w-5 h-5 sm:w-6 sm:h-6 border-[#E5E7EB] rounded-lg data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                                                    />
                                                    <label
                                                        htmlFor={`pos-${index}-${position.id}`}
                                                        className="!mb-0 text-sm font-normal text-[#6B7280] cursor-pointer leading-snug sm:leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                                    >
                                                        {position.name}
                                                    </label>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {errors?.position_soughts?.[index]?.position_ids && (
                                        <p className="text-xs text-red-500 mt-2 italic">
                                            {errors.position_soughts[index].position_ids.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Conditional Specialist Role Section (Full Width Below) */}
                            {showSpecialistRole && (
                                <div
                                    className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="w-full max-w-md space-y-2">
                                        <Label
                                            className="text-[14px] sm:text-[15px] font-medium text-slate-600 flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                            Specialist Dentist Role <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            className={`flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 ${
                                                errors?.position_soughts?.[index]?.specialist_dentist_role ? 'border-red-500' : ''
                                            }`}
                                            {...register(`position_soughts.${index}.specialist_dentist_role`)}
                                        >
                                            <option value="">Choose Specialty...</option>
                                            <option value="orthodontist">Orthodontist</option>
                                            <option value="endodontist">Endodontist</option>
                                            <option value="periodontist">Periodontist</option>
                                            <option value="pediatric dentist">Pediatric Dentist</option>
                                            <option value="prosthodontist">Prosthodontist</option>
                                            <option value="oral and maxillofacial surgeon">Oral & Maxillofacial
                                                Surgeon
                                            </option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
        </div>
    );
};

export default PositionSoughtSection;


// import React from 'react';
// import {Label} from "@components/ui/label";
// import {Checkbox} from "@components/ui/checkbox";
//
// const PositionSoughtSection = ({
//                                    positionRows,
//                                    watch,
//                                    setValue,
//                                    register,
//                                    errors,
//                                    positions,
//                                    professionalCategories
//                                }) => {
//     return (
//         <div className="w-full space-y-8 my-6">
//             {positionRows?.length > 0 &&
//                 positionRows.map((row, index) => {
//                     const selectedCategoryId = watch(`position_soughts.${index}.professional_category_id`);
//                     const selectedPositions = watch(`position_soughts.${index}.position_ids`, []);
//                     const specialistDentistPosition = positions?.find(p => p.name === "Specialist Dentist");
//
//                     const showSpecialistRole =
//                         specialistDentistPosition &&
//                         Array.isArray(selectedPositions) &&
//                         selectedPositions.length > 0 &&
//                         selectedPositions.some(posId => Number(posId) === Number(specialistDentistPosition.id));
//
//                     const categoryPositionsForRow = (positions ?? []).filter(
//                         item => Number(item.professional_category_id) === Number(selectedCategoryId)
//                     );
//
//                     // Clear specialist role logic
//                     React.useEffect(() => {
//                         if (!showSpecialistRole) {
//                             setValue(`position_soughts.${index}.specialist_dentist_role`, "");
//                         }
//                     }, [showSpecialistRole, index, setValue]);
//
//                     return (
//                         <div key={row.id} className="relative border border-slate-200 rounded-lg p-6 pt-8 bg-white">
//                             {/* Top Label (Legend style) */}
//                             <span
//                                 className="absolute -top-3 left-4 bg-white px-2 text-[15px] text-slate-400 font-normal">
//                 Position Sought
//               </span>
//
//                             <div className="grid grid-cols-12 gap-8 items-start">
//                                 {/* Left Side: Professional Category */}
//                                 <div className="col-span-12 md:col-span-5 space-y-2">
//                                     <Label className="text-[15px] font-medium text-slate-600">
//                                         Professional Category
//                                     </Label>
//
//                                     <div className="relative">
//                                         <select
//                                             className={`flex h-11 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${
//                                                 errors?.position_soughts?.[index]?.professional_category_id ? 'border-red-500' : 'border-slate-200'
//                                             }`}
//                                             {...register(`position_soughts.${index}.professional_category_id`)}
//                                             disabled
//                                         >
//                                             <option value="">Select category</option>
//                                             {Array.isArray(professionalCategories) && professionalCategories.map(category => (
//                                                 <option key={category.id} value={category.id}>{category.name}</option>
//                                             ))}
//                                         </select>
//                                         {/* নিচে একটি কাস্টম আইকন যোগ করা হয়েছে কারণ appearance-none দিলে ডিফল্ট অ্যারো চলে যায় */}
//                                         <div
//                                             className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
//                                             <svg className="h-4 w-4 opacity-50" xmlns="http://www.w3.org/2000/svg"
//                                                  fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
//                                                       d="M19 9l-7 7-7-7"/>
//                                             </svg>
//                                         </div>
//                                     </div>
//
//                                     {errors?.position_soughts?.[index]?.professional_category_id && (
//                                         <p className="text-xs text-red-500 mt-1">{errors.position_soughts[index].professional_category_id.message}</p>
//                                     )}
//                                 </div>
//
//                                 {/* Right Side: Position Sought Options */}
//                                 <div className="col-span-12 md:col-span-7 space-y-3">
//                                     <Label className="text-[15px] font-medium text-slate-600">
//                                         Position Sought
//                                     </Label>
//
//                                     <div
//                                         className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 border border-[#E5E7EB] bg-[#FBFBFB] px-[14px] py-[10px] rounded-lg">
//                                         {categoryPositionsForRow.map((position) => {
//                                             const isChecked = selectedPositions?.includes(String(position.id)) || selectedPositions?.includes(Number(position.id));
//
//                                             return (
//                                                 <div key={position.id} className="flex items-center space-x-2 gap-2">
//                                                     <Checkbox
//                                                         id={`pos-${index}-${position.id}`}
//                                                         checked={isChecked}
//                                                         onCheckedChange={(checked) => {
//                                                             // Image e check box thakleo apnar logic single selection maintain korche
//                                                             if (checked) {
//                                                                 setValue(`position_soughts.${index}.position_ids`, [String(position.id)]);
//                                                             } else {
//                                                                 setValue(`position_soughts.${index}.position_ids`, []);
//                                                             }
//                                                         }}
//                                                         className="w-6 h-6 border-[#E5E7EB] rounded-lg data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
//                                                     />
//                                                     <label
//                                                         htmlFor={`pos-${index}-${position.id}`}
//                                                         className="!mb-0 text-sm font-normal text-[#6B7280] cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
//                                                     >
//                                                         {position.name}
//                                                     </label>
//                                                 </div>
//                                             );
//                                         })}
//                                     </div>
//
//                                     {errors?.position_soughts?.[index]?.position_ids && (
//                                         <p className="text-xs text-red-500 mt-2 italic">
//                                             {errors.position_soughts[index].position_ids.message}
//                                         </p>
//                                     )}
//                                 </div>
//                             </div>
//
//                             {/* Conditional Specialist Role Section (Full Width Below) */}
//                             {showSpecialistRole && (
//                                 <div
//                                     className="mt-8 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-300">
//                                     <div className="max-w-md space-y-2">
//                                         <Label
//                                             className="text-[15px] font-medium text-slate-600 flex items-center gap-2">
//                                             <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
//                                             Specialist Dentist Role <span className="text-red-500">*</span>
//                                         </Label>
//                                         <select
//                                             className={`flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 ${
//                                                 errors?.position_soughts?.[index]?.specialist_dentist_role ? 'border-red-500' : ''
//                                             }`}
//                                             {...register(`position_soughts.${index}.specialist_dentist_role`)}
//                                         >
//                                             <option value="">Choose Specialty...</option>
//                                             <option value="orthodontist">Orthodontist</option>
//                                             <option value="endodontist">Endodontist</option>
//                                             <option value="periodontist">Periodontist</option>
//                                             <option value="pediatric dentist">Pediatric Dentist</option>
//                                             <option value="prosthodontist">Prosthodontist</option>
//                                             <option value="oral and maxillofacial surgeon">Oral & Maxillofacial
//                                                 Surgeon
//                                             </option>
//                                         </select>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 })}
//         </div>
//     );
// };
//
// export default PositionSoughtSection;