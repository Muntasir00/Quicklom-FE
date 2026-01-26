import React from "react";

const MessagingForm = ({
    formId, 
    handleSubmit, 
    onSubmit,
    register,
    errors,
    uploadedFile = null,   
    setUploadedFile = () => {} 
}) => {
    return (
        <form id={formId ?? ""} onSubmit={handleSubmit(onSubmit)}>
            <div className="input-group">
                <span className="input-group-text bg-transparent border-0 pe-0">
                    <input {...register("attachment")} name="attachment" type="file" id="fileInput" hidden 
                        onChange={(event) => {
                            try {
                                const file = event.target.files[0];
                                if (file) {
                                    console.log("uploaded filename", file.name);
                                    setUploadedFile(file.name);       
                                }

                                register("attachment").onChange(event);
                            } catch (error) {
                                console.error("Error occured", error);
                            }
                        }}
                    />
                    <button onClick={() => document.getElementById("fileInput").click()} type="button" className="btn btn-link p-0 text-muted">
                        <i className="fas fa-paperclip fa-lg"></i>
                    </button>
                </span>
                
                <input {...register("body")} type="text" name="body" placeholder="Type Message ..." className="form-control" />
                <span className="input-group-append">
                    <button form={formId} type="submit" className="btn btn-primary">Send</button>
                </span>
            </div>
            
            {uploadedFile && (
                <span className="ms-2 text-muted small float-end">
                    {uploadedFile.length > 20 ? uploadedFile.slice(0, 20) + "..." : uploadedFile}
                </span>
            )}
            
            {errors && Object.keys(errors).length > 0 && (
                <div className="text-danger small float-right">
                    {Object.entries(errors).map(([fieldName, error], i) => (
                        <div key={i}>
                            <strong>{fieldName}:</strong>{" "}
                            {error.types ? Object.values(error.types).join(", ") : error.message}
                        </div>
                    ))}
                </div>
            )}

        </form>
    );
}

export default MessagingForm;