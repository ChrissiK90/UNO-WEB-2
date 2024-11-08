document.addEventListener('DOMContentLoaded', function () {
    const playerModal = new bootstrap.Modal(document.getElementById('playerModal'));
    playerModal.show();

    document.getElementById('start-game-btn').addEventListener('click', startNewGame);
});

function startNewGame() {
    const playerNames = [
        document.getElementById('player1').value,
        document.getElementById('player2').value,
        document.getElementById('player3').value,
        document.getElementById('player4').value
    ];

    if (playerNames.some(name => name.trim() === '')) {
        alert("Please enter all player names.");
        return;
    }

    fetch('https://nowaunoweb.azurewebsites.net/api/game/start', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(playerNames)
    })
    .then(response => response.json())
    .then(data => {
        const gameId = data.Id;
        data.Players.forEach((player, index) => {
            displayPlayerCards(player.Cards, index + 1, playerNames[index]);
        });

        fetchTopCard(gameId); // Fetch and display the top card
        const playerModal = bootstrap.Modal.getInstance(document.getElementById('playerModal'));
        playerModal.hide();
    })
    .catch(error => console.error("Error starting game:", error));
}

function displayPlayerCards(cards, playerNumber, playerName) {
    document.getElementById(`player${playerNumber}-name`).textContent = `${playerName}'s Cards`;

    const cardListElement = document.getElementById(`card-list-player${playerNumber}`);
    cardListElement.innerHTML = '';

    cards.forEach(card => {
        const cardImage = document.createElement('img');
        cardImage.src = getCardImageUrl(card) || 'https://nowaunoweb.azurewebsites.net/Content/Cards/default.png';
        cardImage.alt = `${card.Text} card image`;
        cardImage.classList.add('card-image');
        cardListElement.appendChild(cardImage);
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
