import React from 'react'
import { upperCaseWords, upperCaseFirst } from "@utils/StringUtils";
import { Link } from "react-router-dom";


export function ContentHeader({ menu, action, menuLink="#" }) {
    return (
        <section className="content-header">
            <div className="container-fluid">
                <div className="row mb-2">
                    <div className="col-sm-6">
                        <h1 className="text-capitalize">{ upperCaseWords(menu ?? "-") }</h1>
                    </div>
                    <div className="col-sm-6">
                        <ol className="breadcrumb float-sm-right">
                            <li className="breadcrumb-item">
                                <Link to={menuLink ?? "#"} className="text-capitalize">{ upperCaseWords(menu ?? "-") }</Link>
                            </li>
                            <li className="breadcrumb-item active">{ upperCaseFirst(action ?? "-") }</li>
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    )
}
