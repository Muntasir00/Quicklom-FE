import React, { useState, useMemo } from "react";
import { useContractForm } from "@hooks/institute/contracts/useContractForm";
import { cleanContractName } from "@utils/StringUtils";

// Category configuration with icons and colors
const CATEGORY_CONFIG = {
    "Dental Care": {
        icon: "fas fa-tooth",
        color: "#17a2b8",
        bgColor: "#e8f4f8",
        order: 1,
    },
    "Pharmacy": {
        icon: "fas fa-pills",
        color: "#28a745",
        bgColor: "#e8f5e9",
        order: 2,
    },
    "Nursing and Home Care": {
        icon: "fas fa-hand-holding-medical",
        color: "#dc3545",
        bgColor: "#fce4ec",
        order: 3,
    },
    "General Practice": {
        icon: "fas fa-stethoscope",
        color: "#6f42c1",
        bgColor: "#f3e5f5",
        order: 4,
    },
    "General Medicine": {
        icon: "fas fa-stethoscope",
        color: "#6f42c1",
        bgColor: "#f3e5f5",
        order: 4,
    },
};

const DEFAULT_CATEGORY_CONFIG = {
    icon: "fas fa-file-medical",
    color: "#6c757d",
    bgColor: "#f8f9fa",
    order: 99,
};

const Form = ({ setSelectedContract, setCurrentStep, contractTypes }) => {
    const [activeCategory, setActiveCategory] = useState(null);

    const {
        register,
        handleSubmit,
        errors,
        onSubmit,
        contractId,
        FORM_ID,
    } = useContractForm({
        setSelectedContract,
        contractTypes,
        setCurrentStep,
    });

    // Group contract types by industry/category
    const groupedContractTypes = useMemo(() => {
        if (!contractTypes || !Array.isArray(contractTypes)) return {};

        const grouped = contractTypes.reduce((acc, type) => {
            const category = type?.industry || "Other";
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(type);
            return acc;
        }, {});

        // Sort categories by their configured order
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

    // Set first category as active by default
    useMemo(() => {
        const categories = Object.keys(groupedContractTypes);
        if (categories.length > 0 && !activeCategory) {
            setActiveCategory(categories[0]);
        }
    }, [groupedContractTypes, activeCategory]);

    const getCategoryConfig = (category) => {
        return CATEGORY_CONFIG[category] || DEFAULT_CATEGORY_CONFIG;
    };

    const categories = Object.keys(groupedContractTypes);
    const activeTypes = groupedContractTypes[activeCategory] || [];
    const activeConfig = getCategoryConfig(activeCategory);

    return (
        <form id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)}>
            <div className="row">
                <div className="col-md-12">
                    <div className="form-group">
                        <label className="control-label font-weight-bold mb-2">
                            <i className="fas fa-file-signature mr-2 text-primary"></i>
                            Select Contract Type <span className="text-danger">*</span>
                        </label>

                        {contractTypes && Array.isArray(contractTypes) && contractTypes.length > 0 ? (
                            <div className="contract-type-selector">
                                {/* Category Tabs */}
                                <div className="category-tabs d-flex flex-wrap mb-3" style={{ gap: '8px' }}>
                                    {categories.map((category) => {
                                        const config = getCategoryConfig(category);
                                        const isActive = activeCategory === category;
                                        const count = groupedContractTypes[category]?.length || 0;

                                        return (
                                            <button
                                                key={category}
                                                type="button"
                                                className={`btn category-tab d-flex align-items-center ${isActive ? 'active' : ''}`}
                                                onClick={() => setActiveCategory(category)}
                                                style={{
                                                    backgroundColor: isActive ? config.color : config.bgColor,
                                                    color: isActive ? 'white' : config.color,
                                                    border: `2px solid ${config.color}`,
                                                    borderRadius: '25px',
                                                    padding: '8px 16px',
                                                    fontWeight: '600',
                                                    transition: 'all 0.2s ease',
                                                    fontSize: '0.9rem'
                                                }}
                                            >
                                                <i className={`${config.icon} mr-2`}></i>
                                                {category}
                                                <span
                                                    className="badge badge-pill ml-2"
                                                    style={{
                                                        backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : config.color,
                                                        color: 'white',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {count}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Contract Types Grid */}
                                <div
                                    className="contract-types-panel p-3 rounded"
                                    style={{
                                        backgroundColor: activeConfig?.bgColor || '#f8f9fa',
                                        border: `2px solid ${activeConfig?.color || '#dee2e6'}`,
                                        minHeight: '200px'
                                    }}
                                >
                                    <div className="row">
                                        {activeTypes.map((type) => (
                                            <div className="col-lg-4 col-md-6 mb-3" key={type?.id}>
                                                <div className="custom-control custom-radio">
                                                    <input
                                                        type="radio"
                                                        className="custom-control-input"
                                                        id={`contract-type-${type?.id}`}
                                                        value={cleanContractName(type?.contract_name ?? "")}
                                                        {...register("contract_category")}
                                                    />
                                                    <label
                                                        className="custom-control-label w-100"
                                                        htmlFor={`contract-type-${type?.id}`}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <div
                                                            className="card mb-0 contract-type-card h-100"
                                                            style={{
                                                                transition: 'all 0.2s ease',
                                                                cursor: 'pointer',
                                                                border: '2px solid #e9ecef',
                                                                borderRadius: '10px'
                                                            }}
                                                        >
                                                            <div className="card-body p-3 text-center">
                                                                <div
                                                                    className="icon-wrapper mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle"
                                                                    style={{
                                                                        width: '50px',
                                                                        height: '50px',
                                                                        backgroundColor: activeConfig?.color || '#6c757d'
                                                                    }}
                                                                >
                                                                    <i className={`${activeConfig?.icon || 'fas fa-file'} text-white`}></i>
                                                                </div>
                                                                <h6 className="mb-1 font-weight-bold" style={{ fontSize: '0.85rem' }}>
                                                                    {type?.contract_name ?? "Unnamed"}
                                                                </h6>
                                                                <span
                                                                    className="badge"
                                                                    style={{
                                                                        backgroundColor: type?.contract_duration_type === 'Temporary' ? '#ffc107' : '#28a745',
                                                                        color: type?.contract_duration_type === 'Temporary' ? '#000' : '#fff',
                                                                        fontSize: '0.7rem'
                                                                    }}
                                                                >
                                                                    {type?.contract_duration_type || "Standard"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {activeTypes.length === 0 && (
                                        <div className="text-center text-muted py-4">
                                            <i className="fas fa-inbox fa-2x mb-2"></i>
                                            <p className="mb-0">No contract types in this category</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="alert alert-danger" role="alert">
                                <div className="d-flex align-items-center">
                                    <i className="fas fa-exclamation-circle fa-2x mr-3"></i>
                                    <div>
                                        <h6 className="mb-1 font-weight-bold">No Contracts Available</h6>
                                        <small>No contract types found. Please contact your administrator or update your profile to access contract types.</small>
                                    </div>
                                </div>
                            </div>
                        )}

                        {errors?.contract_category && (
                            <div className="alert alert-danger mt-3 py-2" role="alert">
                                <i className="fas fa-exclamation-triangle mr-2"></i>
                                <strong>{errors?.contract_category?.message}</strong>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .category-tab:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                .category-tab:focus {
                    outline: none;
                    box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
                }
                .contract-type-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
                    border-color: #007bff !important;
                }
                .custom-control-input:checked ~ .custom-control-label .contract-type-card {
                    border-color: #007bff !important;
                    background-color: #e7f1ff !important;
                    box-shadow: 0 0 0 3px rgba(0,123,255,0.25);
                }
                .custom-control-input:checked ~ .custom-control-label .icon-wrapper {
                    background-color: #007bff !important;
                }
            `}</style>
        </form>
    );
};

export default Form;