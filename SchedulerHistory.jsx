import React from "react";
import { FaTimes } from "react-icons/fa";
import AuthContext from "../../context/AuthContext";
import GoogleLogin from "../GoogleLogin/GoogleLogin";
import { useState, useEffect, useContext } from "react";
const SchedulerHistory = ({ onCloseHistory }) => {
  const [scheduledata, setData] = useState([]);
  const [pageNumber, setPageNumber] = useState(1); // Start from page 1
  const [totalPages, setTotalPages] = useState(0);
  const [gLoginModel, setGLoginModel] = useState(false);
  const [timedout, settimedout] = useState(false);

  const { authUser, setAuthUser } = useContext(AuthContext);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (authUser.auth === false || authUser.token === null) {
          setGLoginModel(true);
          return;
        } else {
          const response = await fetch("https://api.procbee.in/b2bScheduledData/get_scheduled_data", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_email: authUser.email,
              auth_id: authUser.token,
              page_number: pageNumber,
            }),
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          console.log(data);
          setData(data.data);
          setTotalPages(Math.ceil(data.total_records / 10));
          console.log(scheduledata);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        settimedout(true);
      }
    };

    fetchData();
  },   [pageNumber, authUser.auth]);

  const handleClickToggleGoogleLogin = (e, status = false) => {
    setGLoginModel(status);
    if (authUser.auth !== false && authUser.token !== null) handleClickSubmit(e);
  };
  return (
    // <div className=" fixed bottom-0 top-20 left-44 w-3/4 h-full p-10 ml-7 mb-4   fixed inset-0 z-50 flex items-center justify-center  bg-[#2B2D42] bg-opacity-50 overflow-auto">
    //     <div className="popup-container absolute w-full h-full px-40 bg-gray-100 rounded-lg overflow-auto rounded-lg shadow-xl">
    <div className="fixed inset-0 z-50 bottom-0 top-20  flex items-center justify-center bg-[#2B2D42] bg-opacity-50 overflow-auto">
      <div className="relative w-3/4 h-full p-10 bg-gray-100 rounded-lg shadow-xl overflow-auto">
        <h1 className="text-3xl font-bold text-center text-gray-600 mb-5 mt-10">Scheduler Report</h1>
        <button
          onClick={onCloseHistory}
          className=" absolute top-2 right-0 m-4 text-gray-300 hover:text-gray-400 overflow-auto"
        >
          <FaTimes className="h-6 w-6" />
        </button>
        {timedout && (
          <div className="mt-4 text-gray-500 flex items-center justify-center space-x-2 h-full">
            <div className="flex items-center space-x-2">
              {/* <FaSpinner className="animate-spin h-5 w-5 text-blue-500" /> */}
              <span>Error fetching schedule history. Please try again</span>
            </div>
          </div>
        )}
        {!timedout &&(
        <div className=" bg-white rounded-lg p-3 overflow-auto">
          <table className="min-w-full rounded-lg divide-y divide-gray-200">
            <thead className="px-4 bg-gray-50 rounded-lg">
              <tr>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500  tracking-wider justify-center text-center rounded-t1-lg ">
                  Keywords
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500  tracking-wider justify-center text-center">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500  tracking-wider justify-center text-center">
                  Schedule Time
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500  tracking-wider justify-center text-center">
                  Page number
                </th>
                <th className="px-6 py-3 text-left text-md font-medium text-gray-500 tracking-wider justify-center text-center">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scheduledata.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 text-center whitespace-pre-line">{item.search_query}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{item.geography}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{item.scheduled_datetime}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{item.page_number}</td>
                  <td
                    className={`px-6 py-4  text-center whitespace-nowrap ${
                      item.status === "Failure"
                        ? "text-red-500"
                        : item.status === "success"
                        ? "text-gray-500"
                        : "text-green-500"
                    }`}
                  >
                    {/* {item.status_message} */}
                    {item.status_message ? item.status_message : "Processing"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}

        <div className="flex justify-end items-center relative top-2 bottom-0 right-0">
          <button
            className={`text-md font-bold text-white bg-gray-500 hover:bg-blue-700 py-1 px-2 rounded mr-2 ${
              pageNumber === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setPageNumber((prevPageNumber) => Math.max(prevPageNumber - 1, 1))}
            disabled={pageNumber === 1}
          >
            Previous
          </button>
          <span className="text-sm text-black mx-2">Page {pageNumber} of {totalPages}</span>
          <button
            className={`text-md font-bold text-white bg-gray-500 hover:bg-blue-700 py-1 px-5 rounded ml-2 ${
              pageNumber === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => setPageNumber((prevPageNumber) => Math.min(prevPageNumber + 1, totalPages))}
            disabled={pageNumber === totalPages}
          >
            Next
          </button>
        </div>
        
      </div>

      {gLoginModel && <GoogleLogin onClose={(e) => handleClickToggleGoogleLogin(e, false)} />}
    </div>
  );
};

export default SchedulerHistory;
