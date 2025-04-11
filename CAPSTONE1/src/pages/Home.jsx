import React, { useState, useEffect } from "react";  // Add useEffect here


export default function Home() {
    useEffect(() => {
        console.log(localStorage.getItem("user_id"));  // Should log the user_id
        console.log(localStorage.getItem("role"));     // Should log the role
      }, []);
      
    return (
      <div className="w-full h-full">
        <h1 className="text-4xl font-bold mb-6">Admin Dashboard</h1>
  
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-indigo-600 p-6 rounded-md shadow-md">Card 1</div>
          <div className="bg-indigo-600 p-6 rounded-md shadow-md">Card 2</div>
          <div className="bg-indigo-600 p-6 rounded-md shadow-md">Card 3</div>
          <div className="bg-indigo-600 p-6 rounded-md shadow-md">Card 4</div>
          <div className="bg-indigo-600 p-6 rounded-md shadow-md">Card 5</div>
          <div className="bg-indigo-600 p-6 rounded-md shadow-md">Card 6</div>
        </div>
      </div>
    );
  }
  