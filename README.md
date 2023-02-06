# loginPageJs

Essa é uma api de auttenticação feita com base no mesmo projeto da beerApiJS, com o intuito de agregar no portifólio de dev

> WORKFLOW:        
**REQUEST --> app.js --> Routes --> Controllers --> RESPONSE ...**

> ERROR WORKFLOW:
**REQUEST --> app.js --> errorControll.js --> RESPONSE ...**

> AUTH WORKFLOW:

* ##### SIGNIN --> create jwt --> header-authorization && cookie --> registred/logued

* ##### LOGIN --> create jwt --> cookie --> logued


* **PROTECT ROUTES** --> user logued --> verify headers (authControll.js) --> verify jwt --> authorized ...


* **UPDATE PASS** --> find user + pass no DB --> comparePassword --> update e save new pass  

* **RESET PASS** --> genarete new token --> verify db token --> create jwt --> save new pass
                
* **FORGOT PASS** --> find user --> resetPassResetToken --> send email ...

<!-- ![print](https://github.com/geleiaa/loginPageJs/blob/main/print/loginpage.png) -->
