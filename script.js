const audioPlayer = document.getElementById('audioPlayer');
let currFolder;
let allSongs = [];
let currentIndex = 0;

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch('songMeta.json');
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }

    let songList = document.querySelector(".songlist");
    songList.innerHTML = "";
    for (let song of songs) {
        let filename = song.split('/').pop().replace('.mp3', '').replaceAll("%20", " ");
        let [name, artist] = filename.split(' - ');
        let songname = name.trim();
        let songartist = artist ? artist.trim() : "Unknown Artist";
        let image = `imgFolder/${songname}.png`;
        songList.innerHTML += `
        <div class="song" data-title="${songname}" data-fullpath="${song}">
            <div class="playmusic">
                <img src="imgFolder/play.svg" alt="play">
            </div>
            <img src="${image}" alt="${songname}" height="100px" width="100px">
            <div class="songinfo">
                <h3>${songname}</h3>
                <p>${songartist}</p>
            </div>
        </div>`;
    }

    allSongs = songs;
    attachSongClickEvents();
    return songs;
}

function attachSongClickEvents() {
    const songs = document.querySelectorAll('.song');
    songs.forEach((songDiv, index) => {
        songDiv.addEventListener('click', () => {
            const title = songDiv.dataset.title;
            const fullPath = songDiv.dataset.fullpath;
            audioPlayer.src = fullPath;
            audioPlayer.style.display = 'block';
            audioPlayer.play();
            document.querySelector('.control .songabt').textContent = title;
            currentIndex = index;
        });
    });
}

const audio = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playbtn');
const songInfo = document.querySelector('.playbar .songinfo');
const seekBar = document.querySelector('.playbar .seekbar');
const seekCircle = document.querySelector('.playbar .circle');
const songTime = document.querySelector('.playbar .songtime');

let isPlaying = false;

playBtn.addEventListener('click', () => {
    if (isPlaying) {
        audio.pause();
    } else {
        audio.play();
    }
});

audio.addEventListener('play', () => {
    isPlaying = true;
    playBtn.src = 'imgFolder/songpause.svg'; 
});

audio.addEventListener('pause', () => {
    isPlaying = false;
    playBtn.src = 'imgFolder/songplay.svg'; 
});

audio.addEventListener('timeupdate', () => {
    const current = formatTime(audio.currentTime);
    const duration = formatTime(audio.duration);
    songTime.textContent = `${current} / ${duration}`;
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    seekBar.style.background = `linear-gradient(to right, #ffffff ${progressPercent}%, #696969 ${progressPercent}%)`;
    seekCircle.style.left = `${progressPercent}%`;
});

seekBar.addEventListener('click', (e) => {
    const rect = seekBar.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const newTime = (offsetX / rect.width) * audio.duration;
    audio.currentTime = newTime;
});

function formatTime(time) {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});
document.querySelector(".closebtn").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
});

let prevsongbtn = document.querySelector("#prevbtn");
let nextsongbtn = document.querySelector("#nextbtn");

nextsongbtn.addEventListener("click", () => {
    if (allSongs.length === 0) return;
    currentIndex = (currentIndex + 1) % allSongs.length;
    playCurrentSong();
});

prevsongbtn.addEventListener("click", () => {
    if (allSongs.length === 0) return;
    currentIndex = (currentIndex - 1 + allSongs.length) % allSongs.length;
    playCurrentSong();
});

function playCurrentSong() {
    const currentSongPath = allSongs[currentIndex];
    const title = currentSongPath.split('/').pop().replace('.mp3', '').replaceAll("%20", " ");
    audioPlayer.src = currentSongPath;
    audioPlayer.play();
    document.querySelector('.control .songabt').textContent = title;
}

// FIXED: Used declared variable instead of undefined currentSongs
Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
        await getsongs(item.currentTarget.dataset.folder);
    });
});
