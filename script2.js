window.onload = function() {
    var canvas, ctx;
    var delay = 100;

    var blockSize = 30;
    var cvsW = 1200;
    var cvsH = 810;
    var snake;
    var apple;
    var widthInBlock = cvsW / blockSize;
    var heightInBlock = cvsH / blockSize;
    var timeout;
    var gridCounter = 0;
    var gridDivider = 20;
    var gridDrawWait = 100;
    var gridMaxCounter = gridDivider * 2 + gridDrawWait;

    var score;

    init();

    function init() {
        document.body.style.background = "linear-gradient(to right, teal, blue)";

        canvas = document.createElement("canvas");
        canvas.width = cvsW;
        canvas.height = cvsH;
        
        canvas.style.border = "30px solid black";
        canvas.style.boxShadow = "0 0 30px 30px rgba(0, 0, 0, 0.5)";

        canvas.style.margin = "50px auto";
        canvas.style.display = "block";
        canvas.style.backgroundColor = "#DDD";

        document.body.appendChild(canvas);

        ctx = canvas.getContext('2d');
        snake = new Snake([[6, 4], [5, 4], [4, 4]], "right");
        apple = new Apple([10, 10]);
        score = 0;
        
        refreshCanvas();
    }

    function refreshCanvas() {        
        snake.advance();
        if (snake.checkCollision()) {
            gameOver();
        } else {
            if (snake.isEatingApple(apple)) {
                snake.ateApple = true;

                do {
                    apple.setNewPos();
                } while(apple.isOnSnake(snake));
                
                score++;

                if (score % 2) {
                    blinkScore = true;
                }
            }

            ctx.clearRect(0, 0, cvsW, cvsH);

            writeTitle();
            drawScore();
            snake.draw();
            apple.draw();

            drawGrid();
            
            timeout = setTimeout(refreshCanvas, delay);
        }
    }

    function writeTitle() {
        ctx.save();

        ctx.font = "bold 50px sans-serif";
        ctx.fillStyle = "green";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        var centerX = cvsW / 2;
        var centerY = cvsH / 10;

        ctx.fillText("Snake Game !", centerX, centerY);
     
        ctx.restore();
    }

    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.ateApple = false;

        this.draw = function() {
            ctx.save();
            
            for (var i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i], i == 0);
            }

            ctx.restore();
        }

        this.advance = function() {
            var nextPos = this.body[0].slice();

            switch(this.direction) {
                case "left":
                    nextPos[0] -= 1;
                    break;
                case "right":
                    nextPos[0] += 1;
                    break;
                case "down":
                    nextPos[1] += 1;
                    break;
                case "up":
                    nextPos[1] -= 1;
                    break;
                default:
                    throw("invalid direction: " + this.direction);
            }
            this.body.unshift(nextPos);

            if (!snake.ateApple) {
                this.body.pop();
            } else {
                this.ateApple = false;
            }
        };

        this.setDirection = function(newDirection) {
            var allowedDirection;

            switch (this.direction) {
                case "left":
                case "right":
                    allowedDirection = ["up", "down"];
                    break;
                case "down":
                case "up":
                    allowedDirection = ["left", "right"];
                    break;
                default:
                    throw("invalid direction: " + this.direction);
            }

            if (allowedDirection.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };

        this.checkCollision = function() {
            var wallCollision = false;
            var snakeCollision = false;

            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0, minY = 0;
            var maxX = widthInBlock - 1, maxY = heightInBlock - 1;
            var isNotBetweenHorWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerWalls = snakeY < minY || snakeY > maxY;

            if (isNotBetweenHorWalls || isNotBetweenVerWalls) {
                wallCollision = true;
            }

            for (var i = 0; i < rest.length; i++) {
                if (snakeX == rest[i][0] && snakeY == rest[i][1]) {
                    snakeCollision = true;
                }
            }

            return wallCollision || snakeCollision;
        };

        this.isEatingApple = function(appleToEat) {
            var head = this.body[0];

            if(head[0] === appleToEat.pos[0] && head[1] == appleToEat.pos[1]) {
                return true;
            } else {
                return false;
            }
        };
    }

    function gameOver() {
        ctx.save();


        ctx.font = "bold 70px sans-serif";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeStyle = "white";
        ctx.lineWidth = 5;
        
        var centerX = cvsW / 2;
        var centerY = cvsH / 2;

        ctx.strokeText("Game Over", centerX, centerY - 180);
        ctx.fillText("Game Over", centerX, centerY - 180);

        ctx.font = "bold 30px sans-serif";

        ctx.strokeText("Appuyez sur la touche ESPACE pour rejouer", centerX, centerY - 120);
        ctx.fillText("Appuyez sur la touche ESPACE pour rejouer", centerX, centerY - 120);

        ctx.restore();
    }

    function restart() {
        snake = new Snake([[6, 4], [5, 4], [4, 4]], "right");
        apple = new Apple([10, 10]);

        score = 0;
        clearTimeout(timeout);
        
        refreshCanvas();
    }

    function drawScore() {
        ctx.save();

        ctx.font = "bold 200px sans-serif";
        ctx.fillStyle = "gray";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        var centerX = cvsW / 2;
        var centerY = cvsH / 2;

        ctx.fillText(score.toString(), centerX, centerY);
     
        ctx.restore();
    }

    function drawGrid() {
        // Définir la couleur de la grille
        ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";

        var startX = Math.max(0, (gridCounter - gridDivider - gridDrawWait) * cvsW / gridDivider);
        var startY = Math.max(0, (gridCounter - gridDivider - gridDrawWait) * cvsH / gridDivider);
        var endX = gridCounter * cvsW / gridDivider;
        var endY = gridCounter * cvsH / gridDivider
    
        // Dessiner les lignes verticales
        for (let x = startX; x <= gridCounter * cvsW / gridDivider; x += blockSize) {
            ctx.beginPath();
            ctx.moveTo(x, startY);
            ctx.lineTo(x, endY);
            ctx.stroke();
        }
    
        // Dessiner les lignes horizontales
        for (let y = startY; y <= gridCounter * cvsH / gridDivider; y += blockSize) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
        }

        gridCounter++;

        if (gridCounter > gridMaxCounter) {
            gridCounter = 0;
        }
    }
    

    function drawBlock(ctx, pos, headBlock) {
        var x = pos[0] * blockSize;
        var y = pos[1] * blockSize;

        var marge =  4;
        var iX = x + marge;
        var iY = y + marge;

        ctx.fillStyle = '#000';
        ctx.fillRect(x, y, blockSize, blockSize);

        var iBlockSize = blockSize - marge * 2;

        ctx.fillStyle = headBlock ? '#3C3' : '#FF0000';
        ctx.fillRect(iX, iY, iBlockSize, iBlockSize);
    }

    document.onkeydown = function handleKeyDown(e) {
        var key = e.key;
        var newDirection;

        switch (key) {
            case "ArrowLeft":
                newDirection = "left";
                break;
            case "ArrowUp":
                newDirection = "up";
                break;
            case "ArrowRight":
                newDirection = "right";
                break;
            case "ArrowDown":
                newDirection = "down";
                break;
            case " ":
                restart();
                break;
            default: return;
        }

        snake.setDirection(newDirection);
    }

    function Apple(pos) {
        this.pos = pos;

        this.draw = function() {
            ctx.save();
            
            ctx.fillStyle = '#000';
            ctx.beginPath();

            radius = blockSize / 2;

            var x = this.pos[0] * blockSize  + radius;
            var y = this.pos[1] * blockSize  + radius;

            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill()
            
            ctx.fillStyle = '#3C3';
            ctx.beginPath();

            var radius = blockSize / 2 - 4;

            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill()

            ctx.restore();
        };

        this.setNewPos = function() {
            var newX = Math.round(Math.random() * (widthInBlock - 1));
            var newY = Math.round(Math.random() * (heightInBlock - 1));

            this.pos = [newX, newY];
        };

        this.isOnSnake = function(snakeToCheck) {
            var isOnSnake = false;

            for (var i = 0; i < snakeToCheck.body.length; i++) {
                if (this.pos[0] == snakeToCheck.body[i][0] && this.pos[1] == snakeToCheck.body[i][1]) {
                    isOnSnake = true;
                }   
            }

            return isOnSnake;
        };
    }
}