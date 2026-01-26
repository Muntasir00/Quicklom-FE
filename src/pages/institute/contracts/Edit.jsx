import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom"
import Form from './Form';
import { useEditContract } from "@hooks/institute/contracts/useEditContract";

const Edit = () => {
    const navigate = useNavigate();
    const {
        menu,
        action,
        contractId,
        currentStep,
        setCurrentStep,
        totalSteps,
        sessionUserRole,
        sessionUserId,
        contract,
        setContract,
        selectedContract,
        setSelectedContract,
        contractTypes,
        setContractTypes,
        ContractForm,
        ContractFormHook,
        CONTRACT_FORM_IDS_LIST,
        isLoading
    } = useEditContract();

    // Show loading state
    if (isLoading) {
        return (
            <div className="content-wrapper" style={{ minHeight: 'calc(100vh - 57px)' }}>
                <div className="content-header py-3" style={{ backgroundColor: '#f4f6f9' }}>
                    <div className="container-fluid">
                        <div className="d-flex align-items-center">
                            <div className="spinner-border text-warning mr-3" role="status" style={{ width: '24px', height: '24px' }}>
                                <span className="sr-only">Loading...</span>
                            </div>
                            <span className="text-muted">Loading contract details...</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                                }}
                            >
                                <i className="fas fa-edit text-white" style={{ fontSize: '1.3rem' }}></i>
                            </div>
                            <div>
                                <h4 className="mb-0 font-weight-bold text-dark">Edit Contract</h4>
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    Contract ID: #{contractId}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/institute/contracts')}
                            className="btn btn-outline-secondary px-4"
                            style={{ borderRadius: '8px', fontWeight: '600' }}
                        >
                            <i className="fas fa-arrow-left mr-2"></i>
                            Back to Contracts
                        </button>
                    </div>
                </div>
            </div>

            <section className="content pt-0">
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-lg-10 col-md-12">

                            {/* Main Form Card */}
                            <div className="card shadow-sm">
                                <div className="card-header bg-white border-0 pt-4 pb-0">
                                    <h5 className="mb-0 font-weight-bold">
                                        <i className="fas fa-edit text-warning mr-2"></i>
                                        Update Contract Details
                                    </h5>
                                    {contract && contract.contract_type && (
                                        <p className="text-muted mb-0 mt-2">
                                            <small>
                                                <i className="fas fa-file-contract mr-2"></i>
                                                Contract Type: <strong>{contract.contract_type.contract_name}</strong>
                                            </small>
                                        </p>
                                    )}
                                </div>

                                <div className="card-body p-4">
                                    {!contract ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-warning" role="status">
                                                <span className="sr-only">Loading contract data...</span>
                                            </div>
                                            <p className="mt-3 text-muted">Loading contract data...</p>
                                        </div>
                                    ) : (contract.status === 'booked' || contract.status === 'cancelled') ? (
                                        <div className="alert alert-danger" role="alert">
                                            <div className="d-flex align-items-start">
                                                <i className="fas fa-ban fa-2x mr-3 mt-1"></i>
                                                <div>
                                                    <h5 className="alert-heading mb-2">
                                                        <i className="fas fa-exclamation-triangle mr-2"></i>
                                                        Contract Modification Blocked
                                                    </h5>
                                                    <p className="mb-2">
                                                        This contract cannot be modified because it is <strong>{contract.status}</strong>.
                                                        {contract.status === 'booked' ? (
                                                            <> Booked contracts are committed and cannot be edited to maintain data integrity.</>
                                                        ) : (
                                                            <> Cancelled contracts cannot be edited to maintain data integrity.</>
                                                        )}
                                                    </p>
                                                    <hr />
                                                    <p className="mb-0">
                                                        <i className="fas fa-info-circle mr-2"></i>
                                                        If you need to make changes, please contact support for assistance.
                                                    </p>
                                                    <div className="mt-3">
                                                        <Link
                                                            to="/institute/contracts"
                                                            className="btn btn-outline-danger"
                                                        >
                                                            <i className="fas fa-arrow-left mr-2"></i>
                                                            Back to Contracts
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : ContractForm ? (
                                        <ContractForm
                                            ContractFormHook={ContractFormHook}
                                            contract={contract}
                                            contractId={contractId}
                                        />
                                    ) : (
                                        <div className="alert alert-warning" role="alert">
                                            <i className="fas fa-exclamation-triangle mr-2"></i>
                                            Unable to load contract form. Please try refreshing the page.
                                        </div>
                                    )}
                                </div>

                                {/* Footer Actions */}
                                {contract && contract.status !== 'booked' && contract.status !== 'cancelled' && (
                                    <div className="card-footer bg-light border-0 p-4">
                                        <div className="d-flex justify-content-end align-items-center">
                                            <Link
                                                to="/institute/contracts"
                                                className="btn btn-outline-secondary px-4 mr-3"
                                            >
                                                <i className="fas fa-times mr-2"></i>
                                                Cancel
                                            </Link>
                                            <button
                                                form={CONTRACT_FORM_IDS_LIST[selectedContract]}
                                                className="btn btn-success px-4"
                                                type="submit"
                                            >
                                                <i className="fas fa-save mr-2"></i>
                                                Update Contract
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Help Card */}
                            <div className="card shadow-sm mt-3 d-none d-md-block">
                                <div className="card-body p-3">
                                    <div className="d-flex align-items-center">
                                        <i className="fas fa-question-circle text-warning fa-2x mr-3"></i>
                                        <div>
                                            <h6 className="mb-1">Need Help?</h6>
                                            <small className="text-muted">
                                                Make sure all required fields are filled correctly before updating the contract.
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

export default Edit;