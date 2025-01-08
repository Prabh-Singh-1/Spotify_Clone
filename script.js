console.log('Script is working behind...');
let currentsong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);   
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch("https://prabh-singh-1.github.io/song/ncs/");
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");    
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    // Adding songs to playlist
    let songul = document.querySelector(".playlist").getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + ` <li>
        <img src="music.svg" alt="">
        <div class="info">
            <div>${song.replaceAll("%20", " ")}</div>
            <div>${"Sidhu Moosewala"}</div>
        </div>
        <div class="playnow">
            <span>Play now</span>
            <img src="playbar.svg" alt="" width="45px">
        </div>
    </li>`;
    }
    // Adding Event on each song
    Array.from(document.querySelector(".playlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
    return songs;
}

const playMusic = async (track, pause = false) => {
    if (!currentsong.paused) {
        await currentsong.pause();
    }

    currentsong.src = `/${currFolder}/` + track;

    try {
        currentsong.muted = true;
        await currentsong.play();
        currentsong.muted = false;
        document.getElementById("play").src = "pause.svg";
        document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ");
        document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    } catch (error) {
        console.error("Playback failed:", error);
    }
};

async function main() {
    await getSongs("song/ncs");

    // Wait for user interaction before playing the first song
    document.addEventListener("click", () => {
        if (songs.length > 0) {
            playMusic(songs[0], true);
        }
    }, { once: true });

    // Adding Event for play/pause, and next
    document.getElementById("play").addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play().then(() => {
                document.getElementById("play").src = "pause.svg";
            }).catch(error => {
                console.error("Playback failed:", error);
            });
        } else {
            currentsong.pause();
            document.getElementById("play").src = "playbar.svg";
        }
    });

    // Time update Event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
        document.getElementById("circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Making seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    // Making next button 
    document.getElementById("next").addEventListener("click", () => {
        console.log('i am clicked');
        let i = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((i + 1) < songs.length) {
            playMusic(songs[i + 1]);
        }
    });

    // Making previous button 
    document.getElementById("previous").addEventListener("click", () => {
        console.log('i am clicked');
        let i = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((i - 1) >= 0) {
            playMusic(songs[i - 1]);
        }
    });

    // Making Event for Hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-5px";
    });

    // Making Event for closing Hamburger
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100vw";
    });

    // Making Event for Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    // Making Event to open Songs Folder
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`song/${item.currentTarget.dataset.folder}`);
        });
    });
}

main();
