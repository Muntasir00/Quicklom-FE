import React from "react";

const MessagingForm = ({
                           formId,
                           handleSubmit,
                           onSubmit,
                           register,
                           errors,
                           uploadedFile = null,
                           setUploadedFile = () => {},
                       }) => {
    return (
        <form id={formId ?? ""} onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="flex items-center gap-3">
                {/* attachment */}
                <input
                    {...register("attachment")}
                    name="attachment"
                    type="file"
                    id="fileInput"
                    hidden
                    onChange={(event) => {
                        try {
                            const file = event.target.files[0];
                            if (file) setUploadedFile(file.name);
                            register("attachment").onChange(event);
                        } catch (error) {
                            console.error("Error occured", error);
                        }
                    }}
                />

                <button
                    type="button"
                    onClick={() => document.getElementById("fileInput").click()}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    title="Attach file"
                >
                    <i className="fas fa-paperclip" />
                </button>

                {/* input */}
                <div className="flex-1">
                    <input
                        {...register("body")}
                        type="text"
                        name="body"
                        placeholder="Start typing"
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* send */}
                <button
                    form={formId}
                    type="submit"
                    className="flex h-10 w-12 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    title="Send"
                >
                    <i className="fas fa-paper-plane" />
                </button>
            </div>

            {/* uploaded filename */}
            {uploadedFile && (
                <div className="mt-2 text-right text-xs text-slate-500">
                    {uploadedFile.length > 30 ? uploadedFile.slice(0, 30) + "..." : uploadedFile}
                </div>
            )}

            {/* errors */}
            {errors && Object.keys(errors).length > 0 && (
                <div className="mt-2 text-sm text-red-600">
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
};

export default MessagingForm;



// import React from "react";
//
// const MessagingForm = ({
//     formId,
//     handleSubmit,
//     onSubmit,
//     register,
//     errors,
//     uploadedFile = null,
//     setUploadedFile = () => {}
// }) => {
//     return (
//         <form id={formId ?? ""} onSubmit={handleSubmit(onSubmit)}>
//             <div className="input-group">
//                 <span className="input-group-text bg-transparent border-0 pe-0">
//                     <input {...register("attachment")} name="attachment" type="file" id="fileInput" hidden
//                         onChange={(event) => {
//                             try {
//                                 const file = event.target.files[0];
//                                 if (file) {
//                                     console.log("uploaded filename", file.name);
//                                     setUploadedFile(file.name);
//                                 }
//
//                                 register("attachment").onChange(event);
//                             } catch (error) {
//                                 console.error("Error occured", error);
//                             }
//                         }}
//                     />
//                     <button onClick={() => document.getElementById("fileInput").click()} type="button" className="btn btn-link p-0 text-muted">
//                         <i className="fas fa-paperclip fa-lg"></i>
//                     </button>
//                 </span>
//
//                 <input {...register("body")} type="text" name="body" placeholder="Type Message ..." className="form-control" />
//                 <span className="input-group-append">
//                     <button form={formId} type="submit" className="btn btn-primary">Send</button>
//                 </span>
//             </div>
//
//             {uploadedFile && (
//                 <span className="ms-2 text-muted small float-end">
//                     {uploadedFile.length > 20 ? uploadedFile.slice(0, 20) + "..." : uploadedFile}
//                 </span>
//             )}
//
//             {errors && Object.keys(errors).length > 0 && (
//                 <div className="text-danger small float-right">
//                     {Object.entries(errors).map(([fieldName, error], i) => (
//                         <div key={i}>
//                             <strong>{fieldName}:</strong>{" "}
//                             {error.types ? Object.values(error.types).join(", ") : error.message}
//                         </div>
//                     ))}
//                 </div>
//             )}
//
//         </form>
//     );
// }
//
// export default MessagingForm;