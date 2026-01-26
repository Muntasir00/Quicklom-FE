import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useCreateNotification } from "@hooks/admin/notifications/useCreateNotification";

const CreateNotificationModal = ({ show, setShow}) => {
    const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        users,
        menu,
        sessionUserRole,
        FORM_ID,
        action,
        slug,
        watch,
        setValue,
    } = useCreateNotification(setShow);


    return (
        <Modal show={show} size="md" onHide={() => setShow(false)}>
            <Modal.Header>
                <Modal.Title style={{ fontSize: "1rem" }}>Create Custom Notification</Modal.Title>
                <button type="button" className="close" aria-label="Close" onClick={() => setShow(false)} >
                    <span aria-hidden="true">&times;</span>
                </button>
            </Modal.Header>

            <Modal.Body>
                <form id={FORM_ID ?? ""} onSubmit={handleSubmit(onSubmit)}>
                    <div className="row">
                        <div className="col-md-12">
                            <div className="form-group">
                                <label className="control-label" htmlFor="title">Title <span className="text-red">*</span></label>
                                <input {...register("title")} type="text" className="form-control" id="title" placeholder="Enter Title" />
                                <span className={`text-danger ${errors?.title? "" : "d-none"}`}>
                                    {errors?.title && <strong>{errors?.title?.message}</strong>}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label" htmlFor="user_ids">User <span className="text-red">*</span></label>
                                <select multiple size={6} {...register("user_ids")} className="form-control" id="user_ids">
                                    {Array.isArray(users) && users.length > 0 ? (
                                        users.map((user) => (
                                            <option key={user?.id} value={user?.id}>
                                                {user?.name ?? ""}
                                            </option>
                                        ))
                                    ) : (
                                        <option disabled>No users available</option>
                                    )}
                                </select>
                                <span className={`text-danger ${errors?.user_ids? "" : "d-none"}`}>
                                    {errors?.user_ids && <strong>{errors?.user_ids?.message}</strong>}
                                </span>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="control-label" htmlFor="message">Message <span className="text-red">*</span></label>
                                <textarea {...register("message")} className="form-control" id="message" placeholder="Enter message" rows="5"></textarea>
                                <span className={`text-danger ${errors?.message ? "" : "d-none"}`}>
                                    {errors?.message && <strong>{errors?.message?.message}</strong>}
                                </span>
                            </div>
                        </div>
                    </div>
                </form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setShow(false)}>
                    Close
                </Button>
                <Button form={FORM_ID ?? ""} type="submit" variant="primary">
                    Submit 
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateNotificationModal;
