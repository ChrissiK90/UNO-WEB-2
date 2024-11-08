document.addEventListener('DOMContentLoaded', function () {
    const playerModal = new bootstrap.Modal(document.getElementById('playerModal'), {
        backdrop: 'static', // Prevent closing on click outside
        keyboard: false     // Prevent closing with keyboard (Esc key)
    });
    playerModal.show();

    const startButton = document.getElementById('start-game-btn');
    startButton.addEventListener('click', () => {
        startButton.classList.add('rotate'); // Rotationseffekt hinzufügen

        // Wartezeit für Rotation, bevor das Spiel startet
        setTimeout(() => {
            startButton.classList.remove('rotate'); // Klasse entfernen
            startNewGame(); // Startet das Spiel
            playerModal.hide(); // Verbirgt das Modal
        }, 500); // Wartezeit entspricht der Dauer der Rotation (0.5s)
    });
});

function startNewGame() {
    const playerNames = [
        document.getElementById('player1').value.trim(),
        document.getElementById('player2').value.trim(),
        document.getElementById('player3').value.trim(),
        document.getElementById('player4').value.trim()
    ];

    if (playerNames.some(name => name === '')) {
        alert("Please enter all player names.");
        return;
    }

    const uniqueNames = new Set(playerNames);
    if (uniqueNames.size !== playerNames.length) {
        alert("Keine gleichen Namen");
        return;
    }

    fetch('https://nowaunoweb.azurewebsites.net/api/game/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerNames)
    })
    .then(response => response.json())
    .then(data => {
        const gameId = data.Id;
        data.Players.forEach((player, index) => {
            displayPlayerCards(player.Cards, index + 1, playerNames[index]);
        });

        fetchTopCard(gameId);
        const playerModal = bootstrap.Modal.getInstance(document.getElementById('playerModal'));
        playerModal.hide();
        revealCardsSequentially();
    })
    .catch(error => console.error("Error starting game:", error));
}

function revealCardsSequentially() {
    const playerSections = document.querySelectorAll(".card-list");

    playerSections.forEach((section, index) => {
        const cards = section.querySelectorAll(".card-container");

        cards.forEach((card, i) => {
            // Stelle sicher, dass die Rückseite zuerst sichtbar ist
            card.classList.remove("flipped");

            // Flip-Animation nach einem Zeitintervall ausführen
            setTimeout(() => {
                card.classList.add("flipped");
            }, (index * cards.length + i) * 200); // Verzögerung pro Karte auf 1000 ms setzen
        });
    });
}

function displayPlayerCards(cards, playerNumber, playerName) {
    document.getElementById(`player${playerNumber}-name`).textContent = `${playerName}'s Cards`;
    const cardListElement = document.getElementById(`card-list-player${playerNumber}`);
    cardListElement.innerHTML = '';

    cards.forEach(card => {
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("card-container");

        // Rückseite der Karte
        const cardBack = document.createElement("img");
        cardBack.src = "https://nowaunoweb.azurewebsites.net/Content/back.png";
        cardBack.classList.add("card-image", "card-back");

        // Vorderseite der Karte
        const cardFront = document.createElement("img");
        cardFront.src = getCardImageUrl(card) || "https://nowaunoweb.azurewebsites.net/Content/Cards/default.png";
        cardFront.classList.add("card-image", "card-front");

        cardContainer.appendChild(cardBack);
        cardContainer.appendChild(cardFront);
        cardListElement.appendChild(cardContainer);
    });
}

function fetchTopCard(gameId) {
    fetch(`https://nowaunoweb.azurewebsites.net/api/game/TopCard/${gameId}`)
        .then(response => response.json())
        .then(topCard => {
            document.getElementById('top-card').src = getCardImageUrl(topCard) || 'https://nowaunoweb.azurewebsites.net/Content/back.png';
        })
        .catch(error => console.error("Error fetching top card:", error));
}

function getCardImageUrl(card) {
    const colorCodeMap = {
        "RED": "r",
        "BLUE": "b",
        "YELLOW": "y",
        "GREEN": "g"
    };
    const specialCardsMap = {
        "WILD": "wild",
        "DRAW4": "wd4",
        "CHANGECOLOR": "wild"
    };
    const specialActionMap = {
        "SKIP": "s",
        "REVERSE": "r",
        "DRAW2": "d2"
    };

    const color = card.Color ? card.Color.toUpperCase() : null;
    const text = card.Text ? card.Text.toUpperCase() : null;
    const colorCode = colorCodeMap[color];

    if (specialCardsMap[text]) {
        return `https://nowaunoweb.azurewebsites.net/Content/Cards/${specialCardsMap[text]}.png`;
    } else if (colorCode && specialActionMap[text]) {
        return `https://nowaunoweb.azurewebsites.net/Content/Cards/${colorCode}${specialActionMap[text]}.png`;
    } else if (colorCode && typeof card.Value === 'number') {
        return `https://nowaunoweb.azurewebsites.net/Content/Cards/${colorCode}${card.Value}.png`;
    }

    return null;
}
