import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"
import Form from './Form';
import { useCreateContract } from "@hooks/institute/contracts/useCreateContract";

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
        <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 57px)' }}>
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
                    <div className="row justify-content-center">
                        <div className="col-lg-10 col-md-12">
                            {/* Progress Steps */}
                            <div className="card shadow-sm mb-4">
                                <div className="card-body p-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center flex-fill">
                                            <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                                                 style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                                                {currentStep > 1 ? <i className="fas fa-check"></i> : '1'}
                                            </div>
                                            <div className="ml-3">
                                                <h6 className="mb-0">Select Contract Type</h6>
                                                <small className="text-muted">Choose your contract category</small>
                                            </div>
                                        </div>
                                        <div className={`flex-fill mx-3 ${currentStep >= 2 ? 'border-primary' : 'border-light'}`}
                                             style={{ height: '2px', borderTop: '2px dashed' }}></div>
                                        <div className="d-flex align-items-center flex-fill">
                                            <div className={`rounded-circle d-flex align-items-center justify-content-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-light text-muted'}`}
                                                 style={{ width: '40px', height: '40px', fontWeight: 'bold' }}>
                                                2
                                            </div>
                                            <div className="ml-3">
                                                <h6 className="mb-0">Contract Details</h6>
                                                <small className="text-muted">Fill in contract information</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Main Form Card */}
                            <div className="card shadow-sm">
                                <div className="card-header bg-white border-0 pt-4 pb-0">
                                    <h5 className="mb-0 font-weight-bold">
                                        {currentStep === 1 ? (
                                            <>
                                                <i className="fas fa-file-contract text-primary mr-2"></i>
                                                Select Contract Type
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
                                            <div className="alert alert-info mb-4" role="alert">
                                                <i className="fas fa-info-circle mr-2"></i>
                                                Please select the type of contract you want to create. This will determine the specific fields you need to fill out.
                                            </div>
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