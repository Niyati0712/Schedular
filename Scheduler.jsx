import React, { useState, useEffect, useContext, useRef } from "react";
import { useSpring, animated, useTrail } from "react-spring";
import { FaSpinner } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import AuthContext from "../../context/AuthContext";
import Input from "../Input/Input";
import { FaRobot, FaCheckCircle, FaRegEdit } from "react-icons/fa";
import { MdDelete, MdEdit } from "react-icons/md";
import GoogleLogin from "../GoogleLogin/GoogleLogin";
import ModelBase from "../ModelBase/ModelBase";
import SchedulerHistory from "./SchedulerHistory";
import { IoMdAddCircle } from "react-icons/io";

const Scheduler = ({ onClose }) => {
  const [product, setProduct] = useState("");
  const [country, setCountry] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [locations, setLocations] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showQuestion1, setShowQuestion1] = useState(false);
  const [showQuestion2, setShowQuestion2] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [showLastAns, setShowLastAns] = useState(false);
  const [showLocation, setshowLocation] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [remove, setRemove] = useState(false);
  const [lastPage, setLastPage] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [editableKeywordIndex, setEditableKeywordIndex] = useState(-1);
  const [editedKeyword, setEditedKeyword] = useState("");
  const [editableLocationIndex, setEditableLocationIndex] = useState(-1);
  const [editedLocation, setEditedLocation] = useState("");
  const [gLoginModel, setGLoginModel] = useState(false);
  const [timedout, settimedout] = useState(false);
  const [showhistory, setshowhistory] = useState(false);
  const [pageCount, setPageCount] = useState(3);
  const [lastcountry, setlastcountry] = useState("");
  const keywordsScrollContainerRef = useRef(null);
const locationsScrollContainerRef = useRef(null);



  const currentDate = new Date();
  // const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");

  // Add 5 hours and 40 minutes
  currentDate.setHours(currentDate.getHours() + 5);
  currentDate.setMinutes(currentDate.getMinutes() + 40);

  // Format the date
  const formattedDate = currentDate.toISOString().slice(0, 19).replace("T", " ");

  console.log(formattedDate);
  const { authUser, setAuthUser } = useContext(AuthContext);
  console.log(authUser);
  useEffect(() => {
    setIsVisible(true);
  }, []);
  const question = "Hello, i am your ScheduleGPT";
  const answer = "I am going to help you with scheduling your data.";
  const question1 = "Okay! So tell me what is the product/service you want to sell?";
  const question2 = "In which country/state you want to sell?";
  const submissionText = "Please wait, I am finding appropriate keywords and sub-locations for you.";
  const questiontrail = useTrail(question.length, {
    from: { opacity: 0, transform: "translateY(-20px)" },
    to: { opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(-20px)" },
    config: { tension: 280, friction: 20 },
    // delay: 500, // Delay animation by 500ms
  });
  const answertrail = useTrail(answer.length, {
    from: { opacity: 0, transform: "translateY(-20px))" },
    to: { opacity: isVisible ? 1 : 0, transform: isVisible ? "translateY(0)" : "translateY(-20px)" },
    config: { tension: 100, friction: 10 },
    delay: 200,
  });
  const fadeInAnimation1 = useSpring({
    opacity: showQuestion1 ? 1 : 0,
    from: { opacity: 0 },
    config: { duration: 500 },
  });

  const fadeInAnimation2 = useSpring({
    opacity: showQuestion2 ? 1 : 0,
    from: { opacity: 0 },
    config: { duration: 500 },
  });
  // const handleDeleteKeyword = (keyword) => {
  //   setKeywords(keywords.filter((kw) => kw !== keyword));
  //   setSelectedKeywords(selectedKeywords.filter((kw) => kw !== keyword));
  // };
  const handleDeleteKeyword = (index) => {
    const newKeywords = keywords.filter((_, i) => i !== index);
    setKeywords(newKeywords);
    // Additional logic to handle editable states
    if (index === editableKeywordIndex) {
      setEditableKeywordIndex(-1);
      setEditedKeyword('');
    }
  };


  // const handleDeleteLocation = (location) => {
  //   setLocations(locations.filter((loc) => loc !== location));
  //   setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
  // };
  const handleDeleteLocation = (index) => {
    const newLocations = locations.filter((_, i) => i !== index);
    setLocations(newLocations);
    // Additional logic to handle editable states
    if (index === editableLocationIndex) {
      setEditableLocationIndex(-1);
      setEditedLocation('');
    }
  };
  // UseEffect to trigger showing the answer after a del
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuestion(false);
      setShowAnswer(true);
    }, 3000); // Adjust delay time as needed (3000 milliseconds = 3 seconds)

    // Clean up the timer to avoid memory leaks
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowQuestion(false);
      setShowAnswer(false);
      setShowQuestion1(true);
      // setshowhistorybutton(true);
    }, 7000); // Adjust delay time as needed (3000 milliseconds = 3 seconds)

    // Clean up the timer to avoid memory leaks
    return () => clearTimeout(timer);
  }, []);

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowLastAns(true);

    setShowQuestion2(false);
    setShowSubmitButton(false);
    const timer2 = setTimeout(() => {
      // Make API call to fetch keywords and locations based on product and country
      const fetchData = async () => {
        try {
          const response = await fetch("https://api.procbee.in/commonServices/suggestKeywordsAndLocations", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              b2b_user_uid: "a0d9ce80-6001-42aa-8175-7b0e7334b5da",
              businessType: product, // Use the product state as businessType
              countryLocation: country, // Use the country state as countryLocation
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.statusText}`);
          }

          const data = await response.json();
          console.log(response);

          if (data.status === "failure") {
            throw new Error(`API request failed: ${data.message}`);
          } else {
            // Update keywords and locations state with the response
            setKeywords(data.data.industries || []);
            setLocations(data.data.sub_locations || []);
            setlastcountry(data.data.country|| "")
            // Set showResults to true to display the results
            setShowResults(true);
            setShowSubmitButton(true);
            setShowLastAns(false);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setKeywords([]); // Reset keywords on error
          setLocations([]);
          settimedout(true);
          setShowLastAns(false);
        }
      };
      fetchData();
    }, 2000);

    return () => clearTimeout(timer2);
  };
  // const handleProductChange = (e) => {
  //   const value = e.target.value;
  //   setProduct(value);
  //   setIsProductFilled(value.trim().length > 0); // Check if the input value is not empty
  // };
  // console.log(keywords);
  // console.log(locations);
  // console.log("final array of keywords------", selectedKeywords);
  // console.log("final array of locations---------", selectedLocations);
  const handleNext = () => {
    setShowQuestion1(false);
    setShowQuestion2(true);
    setShowSubmitButton(true);
  };
  const showLocationNow = () => {
    setshowLocation(true);
    setShowResults(false);
  };
  const handleClickToggleGoogleLogin = (e, status = false) => {
    setGLoginModel(status);

    if (authUser.auth !== false && authUser.token !== null) handleClickSubmit(e);
  };
  const handleFinalSubmit = async () => {
    try {
      const searchParameters = [];

      if (authUser.auth === false || authUser.token === null) {
        setGLoginModel(true);
        return;
      }

      // Iterate over selectedKeywords array and create search parameter objects
      else {
        keywords.forEach((keyword) => {
          locations.forEach((location) => {
            searchParameters.push({
              search_query: keyword.toLowerCase(),
              geography: location.toLowerCase(),
              foreign_flag: lastcountry.toLowerCase() === "india" ? 0 : 1,
              page_count: 5,
              search_country: lastcountry.toLowerCase(),
            });
          });
        });

        const requestBody = {
          user_email: authUser.email,
          auth_id: authUser.token,
          search_parameters: searchParameters,
          latitude: "37.0902",
          longitude: "95.7129",
          scheduled_datetime: formattedDate,
        };
        await fetchSearchData(requestBody);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchSearchData = async (body) => {
    try {
      const apiUrl = "https://api.procbee.in/b2bSchedulerApi/b2b-search-scheduler";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const res = await response.json();
      if (res.status == "success") {
        setLastPage(true);
        setShowResults(false);
        throw new Error(res.data);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleKeywordClick = (keyword) => {
    // Check if the keyword is already selected
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
      setRemove(true);
    }
  };
  const handleLocationClick = (location, index) => {
    // Check if the location is already selected
    if (!selectedLocations.includes(location)) {
      setSelectedLocations([...selectedLocations, location]);
      setRemove(true);
      setSelectedIndices([...selectedIndices, index]);
    }
  };
  const handleEditClick = (index, keyword) => {
    setEditableKeywordIndex(index);
    setEditedKeyword(keyword);
  };

  const handleSaveEdit = () => {
    if (editedKeyword.trim() !== "") {
      keywords[editableKeywordIndex] = editedKeyword.trim();
    }
    setEditableKeywordIndex(-1); // Resetting editableKeywordIndex to -1 after saving
  };
  const handleEditClickLocation = (index, location) => {
    setEditableLocationIndex(index);
    setEditedLocation(location);
  };

  const handleSaveEditLocation = () => {
    if (editedLocation.trim() !== "") {
      locations[editableLocationIndex] = editedLocation.trim();
    }
    setEditableLocationIndex(-1);
    setEditedLocation("");
  };
  const handleShowHistory = () => {
    setshowhistory(true);
    setShowLastAns(false);
  };

  const handleCloseHistory = () => {
    setshowhistory(false);
  };

  const handleScheduleMore = () => {
    setShowQuestion1(true);
    setLastPage(false);
  };
  
  const addNewKeyword = () => {
    setKeywords([...keywords, 'New keyword']);
     // Assuming you want to immediately edit the new keyword, set editableKeywordIndex to the new keyword's index
     setEditableKeywordIndex(keywords.length); // This sets the editable index to the new keyword
     setEditedKeyword('New Keyword');

  };

  useEffect(() => {
    if (keywordsScrollContainerRef.current) {
      const { scrollWidth, clientWidth } = keywordsScrollContainerRef.current;
      const maxScrollLeft = scrollWidth - clientWidth;
      keywordsScrollContainerRef.current.scrollLeft = maxScrollLeft;
    }
  }, [keywords.length]); // Dependency on keywords.length ensures this runs after any keyword is added
  


  // Depend on keywords.length to trigger after an item is added
  const addNewLocation = () => {
    setLocations([...locations, 'New Location']); // Placeholder for a new location
    // Setting editableLocationIndex to the new location's index for immediate editing
    setEditableLocationIndex(locations.length);
    setEditedLocation('New Location');
  };

  useEffect(() => {
    if (locationsScrollContainerRef.current) {
      const { scrollWidth, clientWidth } = locationsScrollContainerRef.current;
      const maxScrollLeft = scrollWidth - clientWidth;
      locationsScrollContainerRef.current.scrollLeft = maxScrollLeft;
    }
  }, [locations.length]);

  return (
    <ModelBase>
      <div className="fixed inset-0 flex items-center justify-center z-1000  border-black-100 ">
        <div className="popup-container relative bg-color-100 border-black-100 w-3/4 max-w-screen-xl z-1000 h-full mt-40 opacity-100% overflow-auto">
          <button
            onClick={onClose}
            className=" absolute top-2 right-0 m-4 text-gray-300 hover:text-gray-400 overflow-auto"
          >
            <FaTimes className="h-6 w-6" />
          </button>
          {/* {showhistorybutton &&(
        <Button2 onClick={handleShowHistory} className="absolute top-2 right-10 m-4 text-black hover:text-black bg-primary">
          Report 
        </Button2>
      )}  */}
          <div className="h-full bg-gray-100 overflow-auto">
            <div className="  h-100%">{showhistory && <SchedulerHistory onCloseHistory={handleCloseHistory} />}</div>

            <div className="popup-content bg-white-200 p-5 rounded-lg shadow-md w-full h-full flex flex-col justify-between z-1000 overflow-auto ">
              <div className="text-center text-4xl font-bold mt-2  text-gray-600">
                {showQuestion && (
                  <div className="text-center text-4xl font-bold mt-16 text-gray-600">
                    <div className="flex justify-center items-center h-full mb-8">
                      <FaRobot size={72} style={{ color: "#ffdb58" }} />
                    </div>
                    {questiontrail.map((style, index) => (
                      <animated.span key={index} style={style}>
                        {question[index]}
                      </animated.span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center text-4xl font-bold text-gray-600">
                {showAnswer && (
                  <div className="text-center text-4xl font-bold mt-20 text-gray-600">
                    <div className="flex justify-center items-center h-full mb-8">
                      <FaRobot size={72} style={{ color: "#ffdb58" }} />
                    </div>
                    {answertrail.map((style, index) => (
                      <animated.span key={index} style={style}>
                        {answer[index]}
                      </animated.span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-center text-3xl text-black">
                {showResults && (
                  <div>
                    <h1 className="text-3xl font-bold flex justify-center items-center mx-auto w-full md:w-1/2 mb-4 ">
                      Okay then, let's dive in.
                    </h1>
                    <h4 className="text-[20px] font-seriff flex mx-auto w-full md:w-1/2 mb-4">
                      You can remove or edit the industries and locations you don't want to schedule and then click on
                      schedule extraction.
                    </h4>
                    <h2 className="text-xl font-semibold flex justify-center items-center h-full mx-auto w-full md:w-1/2 mt-4 ">
                      Relevant Industries
                    </h2>
                    
                    <div className="flex justify-center items-center space-x-4 my-4">

                    <div className="flex justify-center overflow-hidden">
                      <div ref={keywordsScrollContainerRef} className="flex flex-nowrap overflow-x-auto items-center justify-start max-w-[calc(158px*5)]">
                        {keywords && keywords.length > 0 ? (
                          keywords.map((keyword, index) => (
                            <div key={index} className="relative inline-block ">
                              <button
                                className={`group  overflow-auto relative h-[170px] w-[150px] max-w-[200px] flex flex-col items-center justify-center rounded rounded-lg border  border-gray-500 text-center shadow-elevation-01 transition-all duration-300 ease-in-out hover:cursor-pointer hover:border-primary hover:bg-blue-200 hover:text-black focus:border-primary-500 focus:bg-blue-200 focus:text-black border-over-card 
                          bg-blue-100
                          text-black m-1 mt-5 ${editableKeywordIndex === index ? "transform scale-110" : ""}`}
                                onClick={() => handleKeywordClick(keyword)}
                                style={{ wordWrap: "break-word" }}
                              >
                                {editableKeywordIndex === index ? (
                                  <div className="relative">
                                    <input
                                      type="text"
                                      className="text-xs p-1 max-w-full border border-blue-50 rounded mb-2 w-3/4"
                                      value={editedKeyword}
                                      onChange={(e) => setEditedKeyword(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleSaveEdit();
                                        }
                                      }}
                                    />
                                    <button
                                      className="px-5 py-0 bg-blue-500 text-white text-[13px] rounded"
                                      onClick={handleSaveEdit}
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div
                                      className={`bg-gray-50 opacity-20%  w-[100%] h-[50px] overflow-hidden ${
                                        keyword.split("\n").length > 1 ? "text-center" : ""
                                      }`}
                                    >
                                      {/* <span className={`text-sm max-w-full px-1 py-2 font-italic line-clamp-2 ${keyword.length > 30 ? 'truncate' : ''} ${keyword.split(' ').length === 1 ? 'h-full flex items-center justify-center' : ''}`}>{keyword}</span>
                                       */}
                                      <span
                                        className={`text-sm opacity-20% max-w-full px-1 py-2 font-italic line-clamp-2 ${
                                          keyword.length > 50 ? "truncate" : ""
                                        } ${
                                          keyword.split(" ").length === 1
                                            ? "h-full flex items-center justify-center"
                                            : ""
                                        }`}
                                      >
                                        {keyword}
                                      </span>
                                    </div>
                                    <div className="border-black rounded p-1 ">
                                      <MdDelete
                                        className="absolute  top-1 right-1 border-black right-1 text-blue-50 cursor-pointer hover:text-blue-400"
                                        size={20}
                                        onClick={() => handleDeleteKeyword(index)}
                                      />
                                    </div>
                                    <div>
                                      <MdEdit
                                        className="absolute top-1 right-6 text-blue-50 cursor-pointer hover:text-blue-400"
                                        size={20}
                                        onClick={() => handleEditClick(index, keyword)}
                                      />
                                    </div>
                                  </>
                                )}
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-red-500">No keywords found... Try again </div>
                        )}
                      </div>
                      </div>
                      <button
                      onClick={() => addNewKeyword()}
                      className="  hover:text-gray-500 text-gray-400 font-bold py-1 px-2 rounded"
                    >
                      <IoMdAddCircle />
                    </button>
                    </div>
                    <h2 className="text-xl font-semibold flex justify-center items-center h-full mx-auto w-full md:w-1/2 mt-10 ">
                      Relevant sub-locations
                    </h2>
                    <div className="flex justify-center items-center space-x-4 my-4">

                    <div className="flex justify-center overflow-hidden">
                      <div ref={locationsScrollContainerRef}className="flex flex-nowrap overflow-x-auto items-center justify-start max-w-[calc(158px*5)]">
                        {locations && locations.length > 0 ? (
                          locations.map((location, index) => (
                            <div key={index} className="relative inline-block">
                              <button
                                className={`group overflow-auto relative h-[170px] w-[150px] max-w-[200px] flex flex-col items-center justify-center rounded rounded-lg border  border-gray-500 text-center shadow-elevation-01 transition-all duration-300 ease-in-out hover:cursor-pointer hover:border-primary hover:bg-blue-200 hover:text-black focus:border-primary-500 focus:bg-blue-200 focus:text-black border-over-card 
                          bg-blue-100 m-1 mt-5 ${editableLocationIndex === index ? "transform scale-110" : ""}`}
                                onClick={() => handleLocationClick(location)}
                                style={{ wordWrap: "break-word" }}
                              >
                                {editableLocationIndex === index ? (
                                  <div className="relative  ">
                                    <input
                                      type="text"
                                      className="text-xs  max-w-full font-italic p-1 border border-gray-300 rounded mb-2 w-3/4"
                                      value={editedLocation}
                                      onChange={(e) => setEditedLocation(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                          handleSaveEditLocation();
                                        }
                                      }}
                                    />
                                    <button
                                      className="px-4 py-0 bg-blue-500 text-white text-[13px] rounded"
                                      type="button"
                                      onClick={handleSaveEditLocation}
                                      style={{ wordWrap: "break-word" }}
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div
                                      className={`bg-gray-50 w-[96%] h-[50px] overflow-hidden ${
                                        location.split("\n").length > 1 ? "text-center" : ""
                                      }`}
                                    >
                                      <span
                                        className={`text-sm max-w-full px-1 py-2 font-italic line-clamp-2 ${
                                          location.length > 50 ? "truncate" : ""
                                        } ${
                                          location.split(" ").length === 1
                                            ? "h-full flex items-center justify-center"
                                            : ""
                                        }`}
                                      >
                                        {location}
                                      </span>
                                    </div>
                                    <div className="flex py  items-center">
                                      <MdDelete
                                        className="absolute top-1 right-1 text-blue-50 cursor-pointer hover:text-blue-400 "
                                        size={20}
                                        onClick={() => handleDeleteLocation(index)}
                                      />
                                      <MdEdit
                                        className="absolute top-1 right-6 text-blue-50 cursor-pointer hover:text-blue-400"
                                        size={20}
                                        onClick={() => handleEditClickLocation(index, location)}
                                      />
                                    </div>
                                  </>
                                )}
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-red-500">No sub-locations found </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addNewLocation()}
                      className="  hover:text-gray-500 text-gray-400 font-bold py-1 px-2 rounded"
                    >
                      <IoMdAddCircle />
                    </button>
                    </div>
                    {/* <div className="flex items-center mt-4 mb-4 space-x-4 justify-center"> 
        <label htmlFor="pageInput" className="block text-lg font-medium text-gray-700">
          Enter page number : 
        </label>
        <input
          type="number"
          id="pageInput"
          className="mt-1  block p-2 border border-gray-300 rounded-md shadow-sm text-sm"
          placeholder="e.g., 3"
          onChange={handlePageCountChange}
          
        /> */}
                    {/* </div> */}

                    <div className="mt-6">
                      <button
                        onClick={handleFinalSubmit}
                        className={`bg-primary text-[18px] text-white px-4 py-2 rounded-full shadow-lg transition duration-300 ease-in-out ${(!keywords || keywords.length === 0) && (!locations || locations.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-400'}`}
    disabled={!keywords || !locations || (keywords.length === 0 && locations.length === 0)} // More defensive check
  >
                        Schedule Extraction
                      </button>
                    </div>
                    {gLoginModel && <GoogleLogin onClose={(e) => handleClickToggleGoogleLogin(e, false)} />}
                  </div>
                )}
              </div>
              <div>
                {lastPage && (
                  <div className="text-center mt-20">
                    <div className="font-extrabold text-4xl text-primary mb-4">
                      <FaCheckCircle className="inline-block mr-4 text-5xl" />
                      <span className="inline-block animate-bounce">Sit back and Relax!...</span>
                    </div>
                    <p className="text-xl mt-15 ml-14 font-semibold">Your extraction has been scheduled.</p>
                    <div className="flex flex-row items-center justify-center space-x-7">
                      <button
                        onClick={handleShowHistory}
                        className="bg-primary text-[20px] text-white px-4 py-2 mt-10 rounded-full shadow-lg hover:bg-blue-400 transition duration-300 ease-in-out"
                      >
                        View Schedule History
                      </button>

                      <button
                        onClick={handleScheduleMore}
                        className="bg-gray-300 text-[20px] text-black px-9 py-2 mt-10 rounded-full shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                      >
                        Schedule more
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center items-center h-full mx-auto w-full md:w-1/2">
                <div className="text-center font-sans-serif mt-12 text-gray-600">
                  {/* Question 1: What is the product  you want to search for? */}
                  <animated.div style={fadeInAnimation1}>
                    {showQuestion1 && (
                      <div>
                        <p className="font-bold text-2xl">{question1}</p>
                        <form
                          className="mt-4 relative"
                          onSubmit={(e) => {
                            e.preventDefault(); // Prevent form submission
                            handleNext(); // Invoke handleNext function
                          }}
                        >
                          <Input
                            id="product"
                            className="border border-gray-400 w-full mb-4 mr-4 mt-6 text-gray-400 text-large"
                            type="text"
                            placeholder="Type of product"
                            value={product}
                            onChange={(e) => setProduct(e.target.value)}
                          />
                          <div className="flex flex-col items-center space-y-4">
                            <button
                              type="submit"
                              onClick={handleNext}
                              className={` bg-primary size-lg text-white px-4 py-2 rounded-full mt-2 ${
                                product.trim().length > 0 ? "" : "opacity-20 cursor-not-allowed"
                              }`}
                              disabled={product.trim().length === 0}
                            >
                              Continue
                            </button>
                            <div>OR</div>
                            <button
                              type="button"
                              onClick={handleShowHistory}
                              className="bg-gray-300 text-[15px] text-gray-700 px-4 py-2 mt-2 rounded-full shadow-lg hover:bg-gray-400 transition duration-300 ease-in-out"
                            >
                              View Previous Schedule History
                            </button>
                          </div>
                        </form>
                      </div>
                    )}
                  </animated.div>

                  {/* Question 2: In which country you want to search for? */}
                  <animated.div style={fadeInAnimation2}>
                    {showQuestion2 && (
                      <div>
                        <p className="font-bold text-2xl">{question2}</p>
                        <form onSubmit={handleSubmit} className="mt-4">
                          <Input
                            id="country"
                            className="border border-gray-400 w-full mb-4 mr-4 mt-6 text-gray-400 text-large"
                            type="text"
                            placeholder="Country/State"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault;
                                setCountry(e.target.value);
                              }
                            }}
                          />
                          {showSubmitButton && (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={handleSubmit}
                                className={`bg-primary text-white px-2 py-1 rounded-full inline-flex items-center ${
                                  country.trim().length > 0 ? "" : "opacity-20 cursor-not-allowed"
                                }`}
                                disabled={country.trim().length === 0}
                              >
                                Submit
                              </button>
                            </div>
                          )}
                        </form>
                      </div>
                    )}
                  </animated.div>

                  {/* Submission text */}
                  {showLastAns && (
                    <div className="mt-4 text-gray-500 flex items-center justify-center space-x-2 h-full">
                      <div className="flex items-center space-x-2">
                        <FaSpinner className="animate-spin h-5 w-5 text-blue-500" />
                        <span>{submissionText}</span>
                      </div>
                    </div>
                  )}
                  {timedout && (
                    <div className="mt-4 text-gray-500 flex items-center justify-center space-x-2 h-full">
                      <div className="flex items-center space-x-2">
                        {/* <FaSpinner className="animate-spin h-5 w-5 text-blue-500" /> */}
                        <span>Error fetching keywords. Please try again</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModelBase>
  );
};

export default Scheduler;
