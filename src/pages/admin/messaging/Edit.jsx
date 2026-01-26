import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"
import { Box, Card, CardContent, Button, Typography } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import RefreshIcon from "@mui/icons-material/Refresh";
import Chat from '@components/messaging/Chat';

import { upperCaseFirst } from "@utils/StringUtils";
import PageHeader from "@components/admin/PageHeader";
import { useUpdateMessaging } from "@hooks/admin/messaging/useUpdateMessaging";

import MessagingForm from "@components/forms/MessagingForm";


const Edit = () => {
   const {
        register,
        handleSubmit,
        onSubmit,
        errors,
        menu,
        sessionUserRole,
        FORM_ID,
        action,
        slug,
        messages,
        SESSION_USER_ID,
        menuLink,
        initializeStateHelper,
    } = useUpdateMessaging();

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="Direct Message"
                subtitle="Continue your conversation"
                icon={<ChatIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${sessionUserRole}/dashboard` },
                    { label: 'Messaging', path: menuLink },
                    { label: action },
                ]}
            />

            <Box sx={{ px: 4, pb: 4 }}>
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.06)',
                    }}
                >
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: '1px solid #e2e8f0',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} color="#1e293b">
                            Direct {menu ?? "-"}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<RefreshIcon />}
                            onClick={() => initializeStateHelper()}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 600,
                                backgroundColor: '#3b82f6',
                                '&:hover': {
                                    backgroundColor: '#2563eb',
                                },
                            }}
                        >
                            Load New
                        </Button>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                        <Chat
                            messages={messages}
                            sessionUserId={SESSION_USER_ID}
                        />
                    </CardContent>

                    <Box
                        sx={{
                            px: 3,
                            py: 2,
                            borderTop: '1px solid #e2e8f0',
                            backgroundColor: '#f8fafc',
                            borderRadius: '0 0 16px 16px',
                        }}
                    >
                        <MessagingForm
                            formId={FORM_ID}
                            handleSubmit={handleSubmit}
                            onSubmit={onSubmit}
                            register={register}
                            errors={errors}
                        />
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}

export default Edit;
