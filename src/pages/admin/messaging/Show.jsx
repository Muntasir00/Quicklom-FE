import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom"
import { Box, Card, CardContent, Button, Typography } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import RefreshIcon from "@mui/icons-material/Refresh";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Chat from '@components/messaging/Chat';
import { upperCaseFirst } from "@utils/StringUtils";
import PageHeader from "@components/admin/PageHeader";
import { useShowMessaging } from "@hooks/admin/messaging/useShowMessaging";


const Show = () => {
   const {
        menu,
        menuLink,
        SESSION_USER_ROLE,
        action,
        slug,
        messages,
        SESSION_USER_ID,
        initializeStateHelper,
        senderId,
    } = useShowMessaging();

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <PageHeader
                title="View Message"
                subtitle="View conversation history"
                icon={<VisibilityIcon />}
                breadcrumbs={[
                    { label: 'Dashboard', path: `/${SESSION_USER_ROLE}/dashboard` },
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
                            sessionUserId={senderId}
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
                        <Button
                            component={Link}
                            to={menuLink}
                            variant="outlined"
                            startIcon={<ArrowBackRoundedIcon />}
                            sx={{
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                '&:hover': {
                                    borderColor: '#cbd5e1',
                                    backgroundColor: '#f1f5f9',
                                },
                            }}
                        >
                            Back
                        </Button>
                    </Box>
                </Card>
            </Box>
        </Box>
    );
}

export default Show;
