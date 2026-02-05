import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"
import Form from './Form';
import { useCreateContract } from "@hooks/institute/contracts/useCreateContract";
import {Check} from "lucide-react";

const Create = () => {
    const navigate = useNavigate();
    const {
        menu,
        action,
        currentStep,
        setCurrentStep,
        totalSteps,
        sessionUserRole,
        sessionUserId,
        selectedContract,
        setSelectedContract,
        contractTypes,
        setContractTypes,
        ContractForm,
        ContractFormHook,
        CONTRACT_FORM_IDS_LIST
    } = useCreateContract();

    const handleBack = () => {
        if (currentStep <= 1) {
            navigate('/institute/contracts');
        } else {
            setCurrentStep((prev) => prev - 1);
        }
    };       

    return (
        <div className="" style={{ minHeight: 'calc(100vh - 57px)' }}>
            {/* Page Header */}
            <div className="content-header py-3" style={{ backgroundColor: '#f4f6f9', marginTop: '15px' }}>
                <div className="container-fluid">
                    <div className="d-flex flex-wrap justify-content-between align-items-center">
                        <div className="d-flex align-items-center mb-2 mb-md-0">
                            <div
                                className="icon-wrapper mr-3 d-flex align-items-center justify-content-center rounded"
                                style={{
                                    width: '48px',
                                    height: '48px',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                                }}
                            >
                                <i className="fas fa-plus-circle text-white" style={{ fontSize: '1.3rem' }}></i>
                            </div>
                            <div>
                                <h4 className="mb-0 font-weight-bold text-dark">Create Contract</h4>
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    Step {currentStep} of {totalSteps} • {currentStep === 1 ? 'Select type' : 'Fill details'}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleBack}
                            className="btn btn-outline-secondary px-4"
                            style={{ borderRadius: '8px', fontWeight: '600' }}
                        >
                            <i className="fas fa-arrow-left mr-2"></i>
                            {currentStep <= 1 ? 'Back to Contracts' : 'Previous Step'}
                        </button>
                    </div>
                </div>
            </div>

            <section className="content pt-0">
                <div className="container-fluid">
                    <div className="">
                        <div className="">
                            {/* Progress Steps */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                                {/* Step 1: Select Contract Type */}
                                <button
                                    type="button" // ফর্ম সাবমিট হওয়া রোধ করতে
                                    onClick={() => setCurrentStep(1)}
                                    className={`relative py-3 px-6 !rounded-xl border-2 transition-all duration-300 text-left
            ${currentStep === 1
                                        ? "border-blue-500 bg-white shadow-md ring-1 ring-blue-500/20"
                                        : currentStep > 1
                                            ? "border-emerald-500 bg-white shadow-sm"
                                            : "border-gray-200 bg-gray-50 opacity-80"}
            hover:shadow-md active:scale-[0.98]
        `}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Step Icon/Number */}
                                        <div
                                            className={`flex-shrink-0 w-10 h-10 !rounded-lg flex items-center justify-center text-sm font-bold transition-colors
                    ${currentStep === 1
                                                ? "bg-blue-100 text-blue-600"
                                                : currentStep > 1
                                                    ? "bg-emerald-100 text-emerald-600"
                                                    : "bg-gray-100 text-gray-400"}
                `}
                                        >
                                            {currentStep > 1 ? <Check className="h-5 w-5 stroke-[3px]" /> : "1"}
                                        </div>

                                        {/* Step Text */}
                                        <div className="flex-1">
                                            <h3 className={`font-bold !text-base !mb-0 ${currentStep === 1 ? "text-blue-700" : "text-gray-900"}`}>
                                                Select Contract Type
                                            </h3>
                                            <p className="!text-xs text-gray-500 mt-0.5 font-medium !mb-0">Choose your contract category</p>
                                        </div>

                                        {/* Active Indicator Pulse */}
                                        {currentStep === 1 && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                                            </div>
                                        )}
                                    </div>
                                </button>

                                {/* Step 2: Contract Details */}
                                <button
                                    type="button"
                                    onClick={() => currentStep >= 2 && setCurrentStep(2)}
                                    disabled={currentStep < 2} // যদি স্টেপ ১ সম্পন্ন না হয় তবে ক্লিক করা যাবে না
                                    className={`relative py-3 px-6 !rounded-xl border-2 transition-all duration-300 text-left
            ${currentStep === 2
                                        ? "border-blue-500 bg-white shadow-md ring-1 ring-blue-500/20"
                                        : currentStep > 2
                                            ? "border-emerald-500 bg-white shadow-sm"
                                            : "border-gray-100 bg-gray-50 opacity-70"}
            ${currentStep >= 2 ? "hover:shadow-md cursor-pointer active:scale-[0.98]" : "cursor-not-allowed"}
        `}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Step Icon/Number */}
                                        <div
                                            className={`flex-shrink-0 w-10 h-10 !rounded-lg flex items-center justify-center text-sm font-bold transition-colors
                    ${currentStep === 2
                                                ? "bg-blue-100 text-blue-600"
                                                : currentStep > 2
                                                    ? "bg-emerald-100 text-emerald-600"
                                                    : "bg-gray-200 text-gray-400"}
                `}
                                        >
                                            {currentStep > 2 ? <Check className="h-5 w-5 stroke-[3px]" /> : "2"}
                                        </div>

                                        {/* Step Text */}
                                        <div className="flex-1">
                                            <h3 className={`!mb-0 font-bold  !text-base ${currentStep === 2 ? "text-blue-700" : "text-gray-900"}`}>
                                                Contract Details
                                            </h3>
                                            <p className="!mb-0 !text-xs text-gray-500 mt-0.5 font-medium">Fill in contract information</p>
                                        </div>

                                        {/* Active Indicator Pulse */}
                                        {currentStep === 2 && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            </div>

                            {/* Main Form Card */}
                            <div className="card shadow-sm">
                                <div className="card-header bg-white border-0 pt-4 pb-0">
                                    <h5 className="mb-0 font-weight-bold">
                                        {currentStep === 1 ? (
                                            <>
                                                {/*<i className="fas fa-file-contract text-primary mr-2"></i>*/}
                                                {/*Select Contract Type*/}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-edit text-primary mr-2"></i>
                                                Contract Details
                                            </>
                                        )}
                                    </h5>
                                </div>

                                <div className="card-body p-4">
                                    <div className="tab-content">
                                        {/* Step 1: Contract Type Selection */}
                                        <div className={currentStep === 1 ? "tab-pane fade show active" : "tab-pane fade d-none"}>
                                            {/*<div className="alert alert-info mb-4" role="alert">*/}
                                            {/*    <i className="fas fa-info-circle mr-2"></i>*/}
                                            {/*    Please select the type of contract you want to create. This will determine the specific fields you need to fill out.*/}
                                            {/*</div>*/}
                                            <Form setSelectedContract={setSelectedContract} setCurrentStep={setCurrentStep} contractTypes={contractTypes} />
                                        </div>

                                        {/* Step 2: Contract Form */}
                                        <div className={currentStep === 2 ? "tab-pane fade show active" : "tab-pane fade d-none"}>
                                            {ContractForm ? (
                                                <ContractForm ContractFormHook={ContractFormHook} />
                                            ) : (
                                                <div className="alert alert-warning" role="alert">
                                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                                    No contract form found. Please go back and select a contract type.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="card-footer bg-light border-0 p-4">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <button
                                            className="btn btn-outline-secondary px-4"
                                            type="button"
                                            onClick={handleBack}
                                        >
                                            <i className="fas fa-arrow-left mr-2"></i>
                                            {currentStep <= 1 ? 'My Contracts' : 'Back'}
                                        </button>

                                        <div className="text-muted">
                                            <small>Step {currentStep} of {totalSteps}</small>
                                        </div>

                                        {currentStep < totalSteps ? (
                                            <button
                                                form={`form-${currentStep}`}
                                                type="submit"
                                                className="btn btn-primary px-4"
                                            >
                                                Next
                                                <i className="fas fa-arrow-right ml-2"></i>
                                            </button>
                                        ) : (
                                            <button
                                                form={CONTRACT_FORM_IDS_LIST[selectedContract]}
                                                className="btn btn-success px-4"
                                                type="submit"
                                            >
                                                <i className="fas fa-check-circle mr-2"></i>
                                                Create Contract
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Help Card */}
                            <div className="card shadow-sm mt-3 d-none d-md-block">
                                <div className="card-body p-3">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-question-circle text-info fa-2x mr-3"></i>
                                        <div>
                                            <h6 className="mb-1">Need Help?</h6>
                                            <small className="text-muted">
                                                If you have any questions about creating a contract, please contact our support team.
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Create;