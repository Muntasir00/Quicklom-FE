import React from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { sendVerificationTokenService, updateAccountEmail } from "@services/admin/AccountService"
 
const UpdateEmailModelComponent = ({ show, setShow, setValue }) => {
    const [accountData, setAccountData] = React.useState({ email: "", token: null });

    return (
        <Modal show={show} size="md" onHide={() => setShow(false)}>
            <Modal.Header>
                <Modal.Title style={{ fontSize: "1rem" }}>
                    Update Email
                </Modal.Title>
                <button type="button" className="close" aria-label="Close" onClick={() => {setShow(false); setAccountData({ email: "", token: null });}}>
                    <span aria-hidden="true">&times;</span>
                </button>
            </Modal.Header>
            <Modal.Body>
                <form>
                    <div className="alert alert-warning alert-dismissible fade show" role="alert">
                        <i className="fa fa-exclamation-triangle mr-2"></i>
                        <strong>Note:</strong> After hitting verify button, a verification link will be sent to your new email. Please check your inbox to complete the update.  
                        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <label htmlFor="numberInput" className="form-label">Email <span className="text-danger">*</span></label>
                            <div className="input-group mb-3">
                                <input onChange={(e) => setAccountData({ ...accountData, email: e.target.value })} name="email" value={accountData.email} type="email" className="form-control" placeholder="Enter your email" />
                                <div className="input-group-append">
                                    <button onClick={() => {sendVerificationTokenService({email: accountData.email});}} className="btn btn-outline-primary" type="button">Verify</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            <label htmlFor="numberInput" className="form-label">Token <span className="text-danger">*</span></label>
                            <input onChange={(e) => setAccountData({ ...accountData, token: e.target.value })} name="token" value={accountData.token} type="number" className="form-control" placeholder="Enter token" />
                        </div>
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {setShow(false); setAccountData({ email: "", token: null })}}>
                    Close
                </Button>
                <Button variant="primary" 
                    onClick={ async() => {
                        setShow(false); 
                        const status = await updateAccountEmail(accountData)
                        if (!status) return 
                        setValue("email", accountData.email);
                        setAccountData({ email: "", token: null });
                    }}
                >
                    Submit 
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default UpdateEmailModelComponent;
