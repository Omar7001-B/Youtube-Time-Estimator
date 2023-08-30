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

    let videoElement, currentURL, totalVideoLength, startTimeWatching, startVideoWatching, updateTimeIntervalID, watchedVideoDuration = 0;

    function initializeGlobalVariables() {
        totalVideoLength = Math.floor(videoElement.duration);
        currentURL = window.location.href;
        startTimeWatching = Date.now() / 1000;
        startVideoWatching = Math.floor(videoElement.currentTime);
        watchedVideoDuration = 0;
    }

    function createPreviewElement() {
        const playerContent = document.querySelector("#movie_player > div.ytp-player-content.ytp-cultural-moment-player-content");
        const textElement = document.createElement('div');
        textElement.id = 'time-watched-preview';
        textElement.textContent = 'Elapsed: 00:00:00, Speed: 0.00, Remaining: 00:00:00';
        textElement.style = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: black;
            color: white;
            opacity: 0.3;
            padding: 5px;
            border: 1px solid black;
            z-index: 99999;
            border-radius: 7px;
        `;
        playerContent.appendChild(textElement);
    }

    function mainExpectTime() {
        if (!document.getElementById('time-watched-preview')) {
            createPreviewElement();
        }
        initializeGlobalVariables();


        // Archieve
        function parseDurationToSeconds(durationElement) {
            const durationParts = durationElement.split(':').map(Number);

            if (durationParts.length === 3) {
                const [hours, minutes, seconds] = durationParts;
                return hours * 3600 + minutes * 60 + seconds;
            } else if (durationParts.length === 2) {
                const [minutes, seconds] = durationParts;
                return minutes * 60 + seconds;
            } else {
                throw new Error('Invalid duration format');
            }
        }


        function formatDurationFromSeconds(seconds) {
            return new Date(seconds * 1000).toISOString().substr(11, 8);
        }

        function getSecondsDifference(startDate) {
            return (Date.now() / 1000) - startDate;
        }

        function getWatchedDurationFromTimeDisplay() {
            return Math.floor(videoElement.currentTime - startVideoWatching);
        }

        function updateExpectedFinishTime() {
            const newURL = window.location.href;
            if (newURL !== currentURL) {
                currentURL = newURL;
                clearInterval(updateTimeIntervalID);
                startMain();
            }

            watchedVideoDuration = getWatchedDurationFromTimeDisplay();
            const timeElapsed = getSecondsDifference(startTimeWatching);
            const viewerSpeed = (watchedVideoDuration / timeElapsed).toFixed(2);
            const remainingVideoDuration = totalVideoLength - watchedVideoDuration;

            const expectedFinishTime = remainingVideoDuration / viewerSpeed;

            const previewElement = document.getElementById('time-watched-preview');
            previewElement.textContent = `Elapsed: ${formatDurationFromSeconds(timeElapsed)}, Speed: ${viewerSpeed}, Remaining: ${formatDurationFromSeconds(expectedFinishTime)}`;
        }

        updateTimeIntervalID = setInterval(updateExpectedFinishTime, 1000);
    }

    function startMain() {
        const videoCheckInterval = setInterval(() => {
            videoElement = document.querySelector("#movie_player > div.html5-video-container > video");
            if (videoElement) {
                clearInterval(videoCheckInterval);
                mainExpectTime();
            }
        }, 1000);
    }

    startMain();
})();
