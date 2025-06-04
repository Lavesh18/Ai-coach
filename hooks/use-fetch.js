import { toast } from "sonner";

const { useState } = require("react");

const useFetch = (useFn) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const apiCall = async (...args) => {
    setLoading(true);
    setError(null);

    try {
        const response = await useFn(...args);
        setData(response);
        setError(null);
    } catch (error) {
        setError(error);
        toast.error(error.message)
    }finally{
        setLoading(false);
    }
  };

  return { data, loading, error, apiCall, setData };
};

export default useFetch;