# Spritzer
My point o view of the Spritzer library (original from [@luisivan](https://github.com/luisivan/spritzer))  & read more about Spritz at [http://learn2spritz.com/](http://learn2spritz.com/)

View [Live Demo] of Version 0.2.0 (https://long-bat.hyperdev.space/)

Version with a pause/back button , and accelerometer. 

``` html
<script src="<cdn>/jquery.min.js"></script>
<script src="Spritzer.jquery.js"></script>
```

``` html
<text>Spritz is a really cool reading method and this is a library implementing it using Javascript.</text>
```

``` javascript
	var wordsPerMinute = 450;
	var text = ["paragraph 1", "paragraph 2"];	
	var h1 = document.querySelector("#mydiv").appendChild(document.createElement('h1'));
	$(h1).Spritzer({wpm: wordsPerMinute, text: text});
	$(document).on("click","#Voltar", function(){
		$(h1).data("Spritzer").backOneParagraph();
	});
	$(document).on("click","#Proximo", function(){
		$(h1).data("Spritzer").toggle();
	});```

