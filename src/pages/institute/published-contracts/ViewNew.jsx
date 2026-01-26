import React, { useState } from "react";
import { useViewPublishedContracts } from "@hooks/institute/published-contracts/useViewPublishedContracts";
import ContractApplicationAdditionalInformationModal from "@components/modals/ContractApplicationAdditionalInformationModal";
import Filter from "@components/forms/UserContractFilterForm";
import { Chip, Tooltip } from "@mui/material";

const View = () => {
    const{
        menu,
        action,
        rows,
        showForm,
        setShowForm,
        show,
        setShow,
        ContractModel,
        showContractData,
        useFilterHook,
        setContracts,
        selectedContractId,
        handleShowModal,
        setSelectedContractId,
    } = useViewPublishedContracts();

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;
    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    const currentRows = rows.slice(startIdx, endIdx);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            open: "#10b981",
            pending: "#f59e0b",
            cancelled: "#ef4444",
            in_discussion: "#6b7280",
            booked: "#3b82f6",
            closed: "#6b7280"
        };
        return colors[status] || "#6b7280";
    };

    return (
        <div className="content-wrapper" style={{minHeight: "calc(100vh - 57px)", overflow: "hidden", display: "flex", flexDirection: "column"}}>
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
                                <i className="fas fa-briefcase text-white" style={{ fontSize: '1.3rem' }}></i>
                            </div>
                            <div>
                                <h4 className="mb-0 font-weight-bold text-dark">Published Contracts</h4>
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    {rows?.length || 0} available job offer{rows?.length !== 1 ? 's' : ''} • Browse and apply
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", padding: "1rem"}}>
                {/* Compact Banner */}
                <div style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    marginBottom: "0.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    <div style={{display: "flex", alignItems: "center", color: "white"}}>
                        <i className="fas fa-search" style={{marginRight: "0.5rem"}}></i>
                        <span style={{fontWeight: "600", fontSize: "14px"}}>Job Offers Portal</span>
                        <span style={{
                            background: "white",
                            color: "#10b981",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            marginLeft: "1rem",
                            fontSize: "12px",
                            fontWeight: "600"
                        }}>
                            {rows?.length || 0} Available
                        </span>
                    </div>
                    <button
                        style={{
                            background: "rgba(255,255,255,0.2)",
                            border: "1px solid rgba(255,255,255,0.3)",
                            color: "white",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px"
                        }}
                        onClick={() => {
                            const filterEl = document.getElementById('filter-section');
                            if (filterEl) {
                                filterEl.style.display = filterEl.style.display === 'none' ? 'block' : 'none';
                            }
                        }}
                    >
                        <i className="fas fa-filter" style={{marginRight: "0.25rem"}}></i> Toggle Filters
                    </button>
                </div>

                {/* Filter Section */}
                <div id="filter-section" style={{display: 'none', marginBottom: "0.5rem"}}>
                    <Filter setContracts={setContracts} useFilterHook={useFilterHook} />
                </div>

                {/* Custom Table */}
                <div style={{flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", background: "white", borderRadius: "4px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)"}}>
                    {/* Table Container */}
                    <div style={{flex: 1, overflow: "auto"}}>
                        <table style={{width: "100%", borderCollapse: "collapse"}}>
                            {/* Header */}
                            <thead style={{
                                position: "sticky",
                                top: 0,
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                zIndex: 10
                            }}>
                                <tr>
                                    <th style={headerStyle}>#</th>
                                    <th style={headerStyle}>Contract</th>
                                    <th style={headerStyle}>Publisher</th>
                                    <th style={headerStyle}>Start</th>
                                    <th style={headerStyle}>End</th>
                                    <th style={headerStyle}>Status</th>
                                    <th style={headerStyle}>App Status</th>
                                    <th style={headerStyle}>Actions</th>
                                </tr>
                            </thead>

                            {/* Body */}
                            <tbody>
                                {currentRows.map((row, idx) => {
                                    const hasApplied = row?.user_application?.has_applied;
                                    return (
                                        <tr key={row.id} style={{
                                            background: idx % 2 === 0 ? "white" : "#f8f9ff",
                                            borderBottom: "1px solid #e8eaf6"
                                        }}>
                                            <td style={cellStyle}>
                                                <span style={{fontWeight: "800", color: "#5a67d8"}}>#{row.id}</span>
                                            </td>
                                            <td style={cellStyle}>
                                                <div style={{display: "flex", alignItems: "center"}}>
                                                    <i className="fas fa-file-contract" style={{color: "#667eea", marginRight: "0.5rem"}}></i>
                                                    <span style={{fontWeight: "700"}}>{row.contract_type?.contract_name || "-"}</span>
                                                </div>
                                            </td>
                                            <td style={cellStyle}>
                                                <div>
                                                    <div style={{fontWeight: "700", fontSize: "12px"}}>{row.published_by?.name || "-"}</div>
                                                    <div style={{fontSize: "10px", color: "#6c757d"}}>{row.published_by?.email || ""}</div>
                                                </div>
                                            </td>
                                            <td style={cellStyle}>
                                                <span style={{fontWeight: "600"}}>{row.start_date ? formatDate(row.start_date) : "-"}</span>
                                            </td>
                                            <td style={cellStyle}>
                                                <span style={{fontWeight: "600"}}>{row.end_date ? formatDate(row.end_date) : "-"}</span>
                                            </td>
                                            <td style={cellStyle}>
                                                <span style={{
                                                    background: getStatusColor(row.status),
                                                    color: "white",
                                                    padding: "0.25rem 0.5rem",
                                                    borderRadius: "4px",
                                                    fontSize: "10px",
                                                    fontWeight: "700",
                                                    textTransform: "uppercase"
                                                }}>
                                                    {row.status?.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td style={cellStyle}>
                                                {hasApplied ? (
                                                    <span style={{
                                                        background: "#10b981",
                                                        color: "white",
                                                        padding: "0.25rem 0.5rem",
                                                        borderRadius: "4px",
                                                        fontSize: "10px",
                                                        fontWeight: "700"
                                                    }}>
                                                        APPLIED
                                                    </span>
                                                ) : (
                                                    <span style={{
                                                        background: "#e5e7eb",
                                                        color: "#6b7280",
                                                        padding: "0.25rem 0.5rem",
                                                        borderRadius: "4px",
                                                        fontSize: "10px",
                                                        fontWeight: "700"
                                                    }}>
                                                        NOT APPLIED
                                                    </span>
                                                )}
                                            </td>
                                            <td style={cellStyle}>
                                                <div style={{display: "flex", gap: "0.5rem"}}>
                                                    {!hasApplied && (
                                                        <button
                                                            style={{
                                                                background: "#3b82f6",
                                                                color: "white",
                                                                border: "none",
                                                                padding: "0.375rem 0.75rem",
                                                                borderRadius: "4px",
                                                                cursor: "pointer",
                                                                fontSize: "11px",
                                                                fontWeight: "700"
                                                            }}
                                                            onClick={() => {
                                                                setSelectedContractId(row.id);
                                                                setShowForm(true);
                                                            }}
                                                        >
                                                            APPLY
                                                        </button>
                                                    )}
                                                    <button
                                                        style={{
                                                            background: "white",
                                                            color: "#3b82f6",
                                                            border: "1px solid #3b82f6",
                                                            padding: "0.375rem 0.75rem",
                                                            borderRadius: "4px",
                                                            cursor: "pointer",
                                                            fontSize: "11px",
                                                            fontWeight: "700"
                                                        }}
                                                        onClick={() => handleShowModal(row.id, row.contract_type?.contract_name)}
                                                    >
                                                        VIEW
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer - Pagination */}
                    <div style={{
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        padding: "0.75rem 1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderTop: "2px solid #5a67d8"
                    }}>
                        <div style={{color: "white", fontSize: "12px", fontWeight: "600"}}>
                            Showing {startIdx + 1} to {Math.min(endIdx, rows.length)} of {rows.length} entries
                        </div>
                        <div style={{display: "flex", gap: "0.5rem"}}>
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(currentPage - 1)}
                                style={{
                                    background: currentPage === 1 ? "rgba(255,255,255,0.2)" : "white",
                                    color: currentPage === 1 ? "rgba(255,255,255,0.5)" : "#667eea",
                                    border: "none",
                                    padding: "0.375rem 0.75rem",
                                    borderRadius: "4px",
                                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}
                            >
                                Previous
                            </button>
                            <span style={{color: "white", padding: "0.375rem 0.75rem", fontSize: "12px", fontWeight: "600"}}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(currentPage + 1)}
                                style={{
                                    background: currentPage === totalPages ? "rgba(255,255,255,0.2)" : "white",
                                    color: currentPage === totalPages ? "rgba(255,255,255,0.5)" : "#667eea",
                                    border: "none",
                                    padding: "0.375rem 0.75rem",
                                    borderRadius: "4px",
                                    cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                                    fontSize: "12px",
                                    fontWeight: "600"
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ContractApplicationAdditionalInformationModal
                show={showForm}
                setShow={setShowForm}
                contractId={selectedContractId}
            />

            {ContractModel && show && (
                <ContractModel
                    show={show}
                    setShow={setShow}
                    contract={showContractData}
                />
            )}
        </div>
    );
};

const headerStyle = {
    padding: "0.75rem",
    textAlign: "left",
    color: "white",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
};

const cellStyle = {
    padding: "0.75rem",
    fontSize: "12px",
    fontWeight: "600",
    color: "#2c3e50"
};

export default View;
