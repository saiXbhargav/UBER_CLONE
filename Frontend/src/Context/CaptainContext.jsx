import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const CaptainDataContext = createContext();

export const CaptainContext = ({ children }) => {
    const [captain, setCaptain] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch captain profile
    const fetchCaptainProfile = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("captainToken");
            if (!token) {
                setError("Authentication token not found");
                setLoading(false);
                return;
            }

            const response = await axios.get("/api/captain/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Captain profile:", response.data);
            setCaptain(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch captain profile");
        } finally {
            setLoading(false);
        }
    };

    // Captain login
    const loginCaptain = async (credentials) => {
        setLoading(true);
        try {
            const response = await axios.post("/api/captain/login", credentials);
            localStorage.setItem("captainToken", response.data.token);
            console.log("Captain token:", response.data.token);
            setCaptain(response.data.captain);
            setError(null);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Captain logout
    const logoutCaptain = () => {
        localStorage.removeItem("captainToken");
        setCaptain(null);
    };

    // Update captain status (available/busy/offline)
    const updateCaptainStatus = async (status) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("captainToken");
            const response = await axios.patch(
                "/api/captain/status",
                { status },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setCaptain({ ...captain, status: response.data.status });
            return true;
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update status");
            return false;
        } finally {
            setLoading(false);
        }
    };

    // Check authentication status on mount
    useEffect(() => {
        if (localStorage.getItem("captainToken")) {
            fetchCaptainProfile();
        }
    }, []);

    const value = {
        captain,
        setCaptain,
        loading,
        error,
        loginCaptain,
        logoutCaptain,
        updateCaptainStatus,
        fetchCaptainProfile
    };

    return (
        <CaptainDataContext.Provider value={value}>
            {children}
        </CaptainDataContext.Provider>
    );
};

export const useCaptain = () => {
    const context = useContext(CaptainContext);
    if (context === undefined) {
        throw new Error("useCaptain must be used within a CaptainProvider");
    }
    return context;
};

export default CaptainContext;