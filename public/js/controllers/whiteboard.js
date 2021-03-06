const WhiteboardController = (() => {
    let self
    function WhiteboardController() {
        // 화이트 보드 초기화
        self = this
        this.whiteBoardCanvas = $('#whiteboard-canvas')
        this.imageBoardCanvas = $('#image-canvas')
        
        this.whiteBoardCanvas[0].width = screen.width
        this.whiteBoardCanvas[0].height = screen.height
        this.imageBoardCanvas[0].width = screen.width
        this.imageBoardCanvas[0].height = screen.height

        // Toolbar 초기화
        this.initWhiteboard()

        // Screen 변화에 따른 화이트 보드 크기 변경
        let w = screen.width
        let h = screen.height
        setInterval(() => {
            if (w !== screen.width || h !== screen.height) {
                w = screen.width
                h = screen.height
                this.resizeCanvas(this.whiteBoardCanvas[0], w, h)
                this.resizeCanvas(this.imageBoardCanvas[0], w, h)
            }
        }, 300)
    }

    let _prototype = WhiteboardController.prototype
    _prototype.goToWhiteboardPage = () => {
        self.showWhiteboardView()
        ConsultingController.hideVideochat()
    }

    _prototype.eraseAll = () => {
        let drawCtx= self.whiteBoardCanvas[0].getContext('2d')
        drawCtx.clearRect(0, 0, self.whiteBoardCanvas[0].width, self.whiteBoardCanvas[0].height)
    }

    _prototype.initWhiteboard = () => {
        window.Logger.success('Initialize whiteboard')
        let drawCtx= self.whiteBoardCanvas[0].getContext('2d')
        let imageCtx = self.imageBoardCanvas[0].getContext('2d')

        drawCtx.clearRect(0, 0, self.whiteBoardCanvas[0].width, self.whiteBoardCanvas[0].height)
        imageCtx.clearRect(0, 0, self.imageBoardCanvas[0].width, self.imageBoardCanvas[0].height)
        self.initToolbar()
    }

    _prototype.initToolbar = () => {
        let ctx = self.whiteBoardCanvas[0].getContext('2d')
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'black';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        WhiteboardModel.setColor('black')
        WhiteboardModel.setThickness(5)
    }

    _prototype.setColor = (msg) => {
        WhiteboardModel.setColor(msg.color) 
        self.whiteBoardCanvas[0].getContext('2d').strokeStyle = msg.color
    }

    _prototype.setEraserSize = (msg) => {

        if (msg.eraserSize === -1) {
            self.eraseAll()
            return
        }

        window.Logger.success('Eraser')
        let ctx = self.whiteBoardCanvas[0].getContext('2d')
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = '#ffffff'
        ctx.strokeStyle = '#ffffff'
        ctx.lineJoin = 'bevel'
        ctx.lineCap = 'butt'
        ctx.lineWidth = msg.eraserSize

        WhiteboardModel.setEraserSize(msg.eraserSize)
        WhiteboardModel.setTooltype('eraser')
    }

    _prototype.setPen = () => {
        window.Logger.success('Pen')
        let ctx = self.whiteBoardCanvas[0].getContext('2d')
        ctx.globalCompositeOperation = 'source-over';
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = WhiteboardModel.getColor()
        ctx.lineWidth = WhiteboardModel.getThickness()

        WhiteboardModel.setTooltype('pen')

    }


    _prototype.setThickness = (msg) => {
        WhiteboardModel.setThickness(msg.lineSize)
        self.whiteBoardCanvas[0].getContext('2d').lineWidth = msg.lineSize

        if (WhiteboardModel.getTooltype() !== 'pen') {
            WhiteboardModel.setTooltype('pen')
            self.setPen()
        }
    }

    _prototype.showWhiteboardView = () => {
        let $whiteboardApp = $('#app-whiteboard')
        $whiteboardApp.css('display', 'block')
    }

    _prototype.hideWhiteboardView = () => {
        let $whiteboardApp = $('#app-whiteboard')
        $whiteboardApp.css('display', 'none')
    }

    _prototype.resizeCanvas = (canvas, width, height) => {
        window.Logger.success('Canvas resizing event', `${width} : ${height}`)
        canvas.width = width
        canvas.height = height
    }

    _prototype.drawImagefile = (msg) => {
        let url = msg.fileUrl
        let img = new Image()
        img.src = url

        img.onload = function() {
            // 1. 비율 구하기
            // 2. 비율에 따라 캔버스 크기 바꾸기
            // 3. 이미지 맵핑하기
            let ratio = self.calRatio(img.naturalWidth, img.naturalHeight, self.whiteBoardCanvas.width(), self.whiteBoardCanvas.height())
            let caledW = img.naturalWidth * ratio
            let caledH = img.naturalHeight * ratio
            window.Logger.info(`이미지 사이즈 조정 비율 --> ${ratio}`)
            window.Logger.info(`기존 이미지 사이즈 --> ${img.naturalWidth}: ${img.naturalHeight}`)
            window.Logger.info(`변경된 이미지 사이즈 --> ${caledW}: ${caledH}`)

            self.resizeCanvas(self.whiteBoardCanvas[0], caledW, caledH)
            self.resizeCanvas(self.imageBoardCanvas[0], caledW, caledH)
            
            self.mapping(img, self.imageBoardCanvas[0], (w, h) => {
                window.Logger.success('Image mapping success')
            })
        }
    }

    _prototype.calRatio = (srcWidth, srcHeight, maxWidth, maxHeight) => {
        return Math.floor(Math.min(maxWidth / srcWidth, maxHeight / srcHeight)  * 1000 ) / 1000
     }

     _prototype.mapping = (img, canvas, callback) => {
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        callback()
    }

    _prototype.doErasing = (msg) => {
        self.doDrawing(msg)
    }

    _prototype.doDrawing = (msg) => {
        let $whiteboardCanvas = self.whiteBoardCanvas
        let ctx = $whiteboardCanvas[0].getContext('2d')
        let x = msg.axisX
        let y = msg.axisY
        let yourWidth = msg.boardWidth
        let yourHeight = msg.boardHeight
        let status = msg.status

        x = ($whiteboardCanvas.width() * x) / yourWidth
        y = ($whiteboardCanvas.height() * y) / yourHeight

        if (status === 'start') {
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.stroke()
        }
        
        if (status === 'move') {
            ctx.lineTo(x, y)
            ctx.stroke()
        }

        if (status === 'end') {
        }
    }
    return new WhiteboardController()
})()
