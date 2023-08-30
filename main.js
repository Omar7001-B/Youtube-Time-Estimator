// ==UserScript==
// @name         Video Expected Finish Time Calculator
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Calculate expected time to finish a video based on your progress and viewing speed.
// @author       You
// @match        *www.youtube.com/*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    // Global Variables
    // Define the video's total duration (in seconds)
    let currentURL = window.location.href;
    let totalVideoLength = Math.floor(document.querySelector("#movie_player > div.html5-video-container > video").duration) || 0; // Replace with the actual total duration of the video


    // Initialize the time you started watching the video and the watched video duration
    let startTimeWatching = Date.now() / 1000;
    let startVideoWatching = Math.floor(document.querySelector("#movie_player > div.html5-video-container > video").currentTime) || 0;


    let watchedVideoDuration = 0;



    function mainExpectTime() {

        // console.log("INSIDE MAIN");

        function initalizeGlobalVariables() {

            // Define the video's total duration (in seconds)
            totalVideoLength = Math.floor(document.querySelector("#movie_player > div.html5-video-container > video").duration); // Replace with the actual total duration of the video
            currentURL = window.location.href;
            // Initialize the time you started watching the video and the watched video duration
            startTimeWatching = Date.now() / 1000;
            startVideoWatching = Math.floor(document.querySelector("#movie_player > div.html5-video-container > video").currentTime);
            watchedVideoDuration = 0;
            // console.log("Intialize Done");
        }


        // Function to create and append the preview element
        function createPreviewElement() {
            // Find the target parent div element
            const playerContent = document.querySelector("#movie_player > div.ytp-player-content.ytp-cultural-moment-player-content");

            // Create a new text element for preview
            const textElement = document.createElement('div');
            textElement.id = 'time-watched-preview';
            textElement.textContent = 'Elapsed: 00:00:00, Speed: 0.00, Finish: 00:00:00';

            // Apply styles to position the text at the top right corner and give it a high z-index
            textElement.style.position = 'absolute';
            textElement.style.top = '10px';
            textElement.style.right = '10px';
            textElement.style.background = 'black';
            textElement.style.color = 'white';
            textElement.style.opacity = '0.3';
            textElement.style.padding = '5px';
            textElement.style.border = '1px solid black';
            textElement.style.zIndex = '99999';
            textElement.style.borderRadius = '7px';

            // Append the text element to the player content
            playerContent.appendChild(textElement);
            // console.log("ELEMENT DONE");
        }

        // Call the function to create and append the preview element
        if (!document.getElementById('time-watched-preview')) {
            // console.log("Check if ELEMEN HERE ");
            createPreviewElement();
        }


        initalizeGlobalVariables();




        // Function to parse duration from format HH:MM:SS or MM:SS to seconds
        function parseDurationToSeconds(durationElement) {
            const durationParts = durationElement.split(':');

            if (durationParts.length === 3) {
                const hours = parseInt(durationParts[0]);
                const minutes = parseInt(durationParts[1]);
                const seconds = parseInt(durationParts[2]);
                return hours * 3600 + minutes * 60 + seconds;
            } else if (durationParts.length === 2) {
                const hours = 0;
                const minutes = parseInt(durationParts[0]);
                const seconds = parseInt(durationParts[1]);
                return minutes * 60 + seconds;
            } else {
                throw new Error('Invalid duration format');
            }
        }

        // Function to format duration from seconds to HH:MM:SS
        function formatDurationFromSeconds(seconds) {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            const remainingSeconds = Math.floor(seconds % 60);

            const formattedHours = hours < 10 ? '0' + hours : hours;
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
            const formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

            return formattedHours + ':' + formattedMinutes + ':' + formattedSeconds;
        }

        // Function to calculate the difference in seconds between two dates
        function getSecondsDifference(startDate) {
            const currentDate = Date.now() / 1000;
            return currentDate - startDate;
        }

        // Get the watched video duration from the time display
        function getWatchedDurationFromTimeDisplay() {
            const videoTimeElement = Math.floor(document.querySelector("#movie_player > div.html5-video-container > video").currentTime);
            // console.log("Start: " + startVideoWatching);
            // console.log("Now: " + videoTimeElement);
            return Math.floor(videoTimeElement - startVideoWatching);
        }

        // Update the expected finish time based on progress and viewing speed
        function updateExpectedFinishTime() {
            // console.log("INSIDE UPDATE");

            const newURL = window.location.href;
            if (newURL !== currentURL) {
                // console.log("LINK CHNAGE");
                currentURL = newURL;
                initalizeGlobalVariables();
            }

            watchedVideoDuration = getWatchedDurationFromTimeDisplay();
            const timeElapsed = getSecondsDifference(startTimeWatching);
            const viewerSpeed = (watchedVideoDuration / timeElapsed).toFixed(2);
            const remainingVideoDuration = totalVideoLength - watchedVideoDuration;

            // console.log('Watched Duration:', formatDurationFromSeconds(watchedVideoDuration));
            // console.log('Time Elapsed:', formatDurationFromSeconds(timeElapsed));
            // console.log('Viewer Speed:', viewerSpeed);
            // console.log('Remaining Duration:', formatDurationFromSeconds(remainingVideoDuration));

            const expectedFinishTime = remainingVideoDuration / viewerSpeed;

            // Display the expected finish time in the console
            // console.log('Expected Finish Time:', formatDurationFromSeconds(expectedFinishTime));

            const previewElement = document.getElementById('time-watched-preview');
            previewElement.textContent = `Elapsed: ${formatDurationFromSeconds(timeElapsed)}, Speed: ${viewerSpeed}, Finish: ${formatDurationFromSeconds(expectedFinishTime)}`;
        }

        // Update the expected finish time every second
        console.log("BEFORE UPDATE");
        setInterval(updateExpectedFinishTime, 1000);
    }




    const videoCheckInterval = setInterval(() => {
        const videoElement = document.querySelector("#movie_player > div.html5-video-container > video");
        if (videoElement) {
            clearInterval(videoCheckInterval); // Stop the interval once the video element is found

            // Wait for 1 second before calling the mainExpectTime() function
            setTimeout(() => {
                mainExpectTime();
            }, 1000);
        }
    }, 1000); // Check every 1 second




})();
