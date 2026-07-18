  const baseColors = [
            "#f9a8d4",
            "#f472b6",
            "#e879f9",
            "#a78bfa",
            "#60a5fa",
            "#4ade80",
            "#f4d03f",
            "#fb923c",
            "#f43f5e"
        ];

        let colors = [];
        let players = [];
        let currentPlayerIndex = 0;
        let mode = "Easy";
        let scoreIncrement = 1;
        let sequence = [];  
        let playerInput = [];
        let gameEnded = false;
        let singlePlayer = false;
        let streakCount = 0; 
        let canPlay = false;

        function showPage(id) {
            document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
            document.getElementById(id).classList.add("active");
        }

        function renderNameInputs() {
            const num = parseInt(document.getElementById("numPlayers").value);
            const div = document.getElementById("nameInputs");
            div.innerHTML = "";
            for (let i = 0; i < num; i++) {
                div.innerHTML += `<input type="text" id="p${i}" placeholder="Player ${i+1}" style="font-size:1.2em; padding:8px; margin:6px; color:#000000;"><br>`; 
            }
        }

        function goToPage2() { 
            showPage("page2"); 
        }

        function startGame() {
            const num = parseInt(document.getElementById("numPlayers").value);
            mode = document.getElementById("mode").value;
            players = [];
            for (let i = 0; i < num; i++) {
                let name = document.getElementById("p" + i).value || "Player " + (i + 1);
                players.push({ name: name, score: 0, status: "Playing" });
            }
            singlePlayer = (num === 1);

            if (mode === "Easy") { 
                colors = baseColors.slice(0, 4); 
                scoreIncrement = 1; 
                document.getElementById("tiles").style.gridTemplateColumns = "repeat(2, var(--tile-size))";
            } else if (mode === "Medium") { 
                colors = baseColors.slice(0, 6); 
                scoreIncrement = 2; 
                document.getElementById("tiles").style.gridTemplateColumns = "repeat(3, var(--tile-size))";
            } else if (mode === "Normal") { 
                colors = baseColors.slice(0, 6); 
                scoreIncrement = 2; 
                document.getElementById("tiles").style.gridTemplateColumns = "repeat(3, var(--tile-size))";
            } else if (mode === "Hard") { 
                colors = baseColors.slice(0, 8); 
                scoreIncrement = 3; 
                document.getElementById("tiles").style.gridTemplateColumns = "repeat(4, var(--tile-size))";
            }

            showPage("page3");
            renderGame();
            startRound();
        }

        function renderGame() {
            renderTiles();
            renderScoreboard();
            showCurrentPlayer();
        }

        function renderTiles() {
            const tilesDiv = document.getElementById("tiles");
            tilesDiv.innerHTML = "";
            colors.forEach(color => {
                const tile = document.createElement("div");
                tile.className = "tile";
                tile.style.background = color;
                tile.dataset.color = color;
                tile.onclick = () => !gameEnded && handlePlayerChoice(color, tile);
                tilesDiv.appendChild(tile);
            });
        }

        function renderScoreboard() {
            const sb = document.getElementById("scoreboard");
            sb.innerHTML = "<tr><th>Player</th><th>Score</th><th>Status</th></tr>";
            players.forEach(p => {
                sb.innerHTML += `<tr><td>${p.name}</td><td>${p.score}</td><td>${p.status}</td></tr>`;
            });

            if (!singlePlayer) {
                const stillIn = players.filter(p => p.status === "Playing");
                if (stillIn.length === 1 && !gameEnded) {
                    gameEnded = true;
                    showWinner(stillIn[0].name);
                }
            }
        }

        function showCurrentPlayer() {
            if (singlePlayer) {
                document.getElementById("currentPlayer").innerText = "Streak Mode - " + players[0].name;
            } else {
                const stillIn = players.filter(p => p.status === "Playing");
                if (stillIn.length > 0) {
                    document.getElementById("currentPlayer").innerText = "Current Player: " + players[currentPlayerIndex].name;
                } else {
                    document.getElementById("currentPlayer").innerText = "No players left!";
                }
            }
        }

        function flashTile(color) {
            const tile = [...document.querySelectorAll(".tile")].find(t => t.dataset.color === color);
            if (tile) {
                tile.classList.add("computer-choice", "active-glow");
                setTimeout(() => { tile.classList.remove("computer-choice", "active-glow"); }, 800);
            }
        }

        function startRound() {
            if (gameEnded) return;
            const nextColor = colors[Math.floor(Math.random() * colors.length)];
            sequence.push(nextColor);
            playerInput = [];
            playSequence();
        }

        function playSequence() {
            canPlay = false;
            let i = 0;
            const interval = setInterval(() => {
                flashTile(sequence[i]);
                i++;
                if (i >= sequence.length) { clearInterval(interval); canPlay = true;}
            }, 1000);
        }

        function handlePlayerChoice(color, tile) {
            if (gameEnded || !canPlay) return;
            playerInput.push(color);
            tile.classList.add("active-glow");
            setTimeout(() => tile.classList.remove("active-glow"), 700);

            if (playerInput[playerInput.length - 1] !== sequence[playerInput.length - 1]) {
                if (singlePlayer) { 
                    document.getElementById("message").innerText = "Streak Lost!";
                    sequence = [];
                    playerInput = [];
                    streakCount = 0;
                    setTimeout(() => { startRound(); }, 1200);
                } else {
                    canPlay = false;
                    players[currentPlayerIndex].status = "Out";
		    renderScoreboard();

		    document.getElementById("message").innerText =
                        `${players[currentPlayerIndex].name} is Out!`;

		    sequence = [];

		    setTimeout(() => {
    			document.getElementById("message").innerText = "";
    			nextTurn();
    			startRound();
		}, 3000);
                }
                return;
            }

            if (playerInput.length === sequence.length) {
                players[currentPlayerIndex].score += scoreIncrement;
                renderScoreboard();
                streakCount++;
                if (singlePlayer && streakCount >= 8) {
                    showWinner(players[0].name);
                    return;
                }
                canPlay = false;
                document.getElementById("message").innerText = getRandomPraise();

		setTimeout(() => {
    			document.getElementById("message").innerText = "";

   		if (singlePlayer) {
        		startRound();
    		} else {
        		nextTurn();
        		startRound();
    			}
		}, 3000);
            }
        }

        function nextTurn() {
            const activePlayers = players.filter(p => p.status === "Playing");
            if (activePlayers.length <= 1) { renderScoreboard(); return; }
            do {
                currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
            } while (players[currentPlayerIndex].status !== "Playing");
            showCurrentPlayer();
        }

        function getRandomPraise() {
            const praises = ["Excellent!", "Great!", "Good!", "Well Done!", "Nice!"];
            return praises[Math.floor(Math.random() * praises.length)];
        }

        function showWinner(winner) {
            const box = document.getElementById("winnerBox");
            box.style.display = "block";
            box.innerHTML = ` Congrats ${winner}! <br><br>
            <button onclick="resetGame()" style="padding:10px 20px; font-size:1.2em; border-radius:8px; background:#f9a8d4; color:#ffffff; border:none; cursor:pointer;">New Game</button>`;
            document.getElementById("message").innerText = "Game Over!";
            launchBalloons();
        }

        function resetGame() {
            colors = [];
            players = [];
            currentPlayerIndex = 0;
            scoreIncrement = 1;
            sequence = [];
            playerInput = [];
            gameEnded = false;
            singlePlayer = false;
            streakCount = 0;
            canPlay = false;

            document.getElementById("winnerBox").style.display = "none";
            document.getElementById("message").innerText = "";
            showPage("page1"); 
            renderNameInputs();
        }

        function launchBalloons() {
            for (let i = 0; i < 20; i++) {
                const b = document.createElement("div");
                b.className = "balloon";
                b.style.left = Math.random() * 100 + "vw";
                b.style.backgroundColor = baseColors[Math.floor(Math.random() * baseColors.length)];
                b.style.animationDuration = (4 + Math.random() * 3) + "s";
                document.body.appendChild(b);
                setTimeout(() => b.remove(), 7000);
            }
        }

        renderNameInputs();