import React, { useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const PaymentCallback = () => {
  const { axios, token, fetchUser, navigate } = useAppContext();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const session_id = params.get("session_id");
    const run = async () => {
      if (!session_id) {
        toast.error("Missing session");
        return navigate("/");
      }
      try {
        const { data } = await axios.post(
          "/api/credit/verify-session",
          { session_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (data.success) {
          toast.success("Credits updated");
          await fetchUser();
        } else {
          toast.error(data.message || "Verification failed");
        }
      } catch (e) {
        toast.error(e.message);
      } finally {
        navigate("/credits");
      }
    };
    run();
  }, []);

  return <div className="p-10">Processing payment...</div>;
};

export default PaymentCallback;