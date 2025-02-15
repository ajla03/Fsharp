open Elmish
open Elmish.React
open Feliz

type Card =
    { id: int         //jedinstveni identifikator za svaku grupu karti 
      image: string   //src, jedinstveni identifikator za svaku kartu 
      selected: bool  //flag za selektovanje karti 
      shake: bool     //flag za shake efekt 
      guessed: bool   //flag za pogodene karte 
      animating:bool  //flag kada je animacija ukljucena 
      istext:bool     //flag kada pogodenu grupu zelimo prikazati u formi teksta 
      popup:bool      //flag za one away popup(kada zelim popup da se prikaze sve karte ce imati setovan ovaj flag)
      gameOver:bool   //gameover flag, potreban za well done popup(well done se prikaze kada igrac pogodi sve asocijacije) 
      shuffle:bool    //potreban za shuffle animaciju fadein 
    }

    static member makeCard(image: string)(id:int) =

        { id = id
          image = image
          selected = false
          shake = false
          guessed = false
          istext=false
          animating=false
          popup=false
          gameOver=false
          shuffle=false
    }

type Game = { cardsToGuess: Card list }

type State =
    | Initial of Game                          //inicijalno, pocetno stanje. Nema pogresnih niti tacnih pokusaja 
    | InitialGuess of Game*int                 //Korisnik je napravio ili dobar ili los pokusaj, int je brojac za iskoristene pokusaje, inicijalno na 0 
    | GameOver of Game                         //stanje igrice kada se svih 4 pokusaja iskoristi

type Message =
    | TileClick of Card  //dispatch-uje se na akciju igraca
    | DeselectAll        // -||- 
    | ShuffleCards       // -||- 
    | Transformed        //koristimo kada  zelimo prikazati pogodene kartice u formi teksta
    | StopShake          //koristimo kada zelimo prestati sa animacijom za shake 
    | Shake              //koristimo kada zelimo pokrenuti animaciju za shake 
    | ShowResult         //koristi se u gameover dijelu igre, prikazuju se rjesenja 
    | PlayAgain          //dispatch-uje se na akciju igraca, u bilo kojem stanju igrac moze ponovo pokrenuti igru  
    | StopAnimating      //koristi se kada zelimo da iskljimo ogranicenje dispatch-ovanja poruka na akciju igraca 

//------------------------------------------------------------------------------------------------------------------------------------------------------------------------
                          (* h e l p e r    f u n c t i o n   f o r   s h u f f l i n g *)
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------

let shuffleCards(cards:Card list):Card list=
      let alreadyGuessed = List.filter (fun c -> c.guessed)  cards   //keep already guessed as they are positioned, dont shuffle them 
      let notGuessed = List.filter (fun c-> c.guessed=false) cards  |> List.map (fun x-> {x with shuffle=true})//will be shuffled 
      let shuffledcards=List.sortBy (fun _ -> System.Random().Next()) notGuessed        
      alreadyGuessed@shuffledcards //append 
    
    (*  s i m p l e    c o n n e c t i o n      p a i r s  *)
let init():State*Cmd<'Msg> = 
   let cards = 
     [ Card.makeCard "dog.png" 1 
       Card.makeCard  "bird.png" 1 
       Card.makeCard  "cat.png" 1 
       Card.makeCard  "butterfly.png" 1  //zivotinje
 
       Card.makeCard "apple.png" 2 //voce
       Card.makeCard  "ananas.png" 2 
       Card.makeCard  "strawberry.png" 2 
       Card.makeCard  "orange.png" 2

       Card.makeCard "sun.png" 3 //prirodne pojave
       Card.makeCard  "rainbow.png" 3 
       Card.makeCard  "cloud.png" 3
       Card.makeCard  "storm.png" 3 

       Card.makeCard  "bike.png" 4 //prevozna sredstva
       Card.makeCard  "airplane.png" 4 
       Card.makeCard  "car.png" 4
       Card.makeCard  "boat.png" 4 
     ]
   let shuffledcards = cards |> shuffleCards              // init state is shuffled 
   Initial {cardsToGuess=shuffledcards |> (List.map (fun x -> {x with shuffle=false}))} , Cmd.none

//-----------------------------------------------------------------------------------------------------------------------------------
                                    (*   h e l p e r    f u n c t i o n s    *)
//-----------------------------------------------------------------------------------------------------------------------------------
let selectCard (card: Card) (cards: Card list) : Card list =    //selektuje samo onu kartu koja ima img src kao i ona koja je kliknuta (image je kao jedinstveni identifikator za svaku kartu)
    cards |> List.map (fun x -> if x.image=card.image then {x with selected=true} else x)

let countSelected (cards: Card list) : int =                    //broji koliko je selektovanih karti u listi 
    cards |> List.filter (fun x -> x.selected) |> List.length


let shakeCards (cards:Card list):Card list=                    //one koje su selektovane (pogresno), postavi flag za shake efekat na true 
    cards |> List.map (fun x-> if x.selected then {x with shake=true} else x)

let deselectCards (cards: Card list) : Card list =             //deselektuje sve karte   
    cards |> List.map (fun x -> {x with selected=false}) 

let markGuessedCards (cards: Card list) : Card list =          //markira guessed flag na true za karte ako im je id isti kao i id prve selected karte (prije toga ce se provjeriti da li su sve selected iste kategorije) 
    let selectedId = cards |> List.find (fun c -> c.selected) |> (fun c -> c.id) //vraca id prve karte na koju naide da je selected
    cards |> List.map (fun c ->
        if c.id = selectedId then 
            { c with guessed = true;}
        else c)
    
let checkMatchingCards (cards: Card list) : bool =             //provjerava se da li su sve selected iste kategorije, vraca bool 
    let selectedCards = cards |> List.filter (fun c -> c.selected)
    let firstId = (List.head selectedCards).id
    selectedCards |> List.forall (fun c -> c.id = firstId)
    

let reorderCards(selectedid:int)(cards:Card list):Card list =  //poreda karte po redoslijedu, guessed na pocetak liste
     let stayFirst= cards |> List.filter(fun c-> c.guessed=true && c.id<>selectedid)
     let matchedCards = cards |> List.filter (fun c -> c.id = selectedid)
     let otherCards = cards |> List.filter (fun c -> c.id <> selectedid && c.guessed=false)
     stayFirst@matchedCards@otherCards
 

let transformCards(cards:Card list):Card list=                  //za one karte koje su pogodene, postavlja flag istext na true 
  List.map (fun x-> if x.guessed then {x with istext=true} else x) cards 
  

let stopShaking(cards:Card list):Card list =                    //postavlja flag za shake i popup na false(popup prikazujemo kada se pogresno odaberu karte i istovremeno se shake dogodi)  
  List.map (fun x-> if x.shake then {x with shake=false;popup=false} else {x with popup=false}) cards     


let setAnimating(cards:Card list):Card list=                    //zelimo da ukljucimo animaciju, zabrana dispatch-ovanja msg od strane igraca dok traje animacija 
    List.map (fun x-> {x with animating=true}) cards


let showCards(cards:Card list):Card list=                       //koristi se samo ako je stanje game over
    let Id = (List.find (fun x -> x.guessed=false) cards).id    //random id of not  guessed cards 
    let markGuessed= List.map (fun x-> if x.id=Id then {x with guessed=true} else x) cards
    markGuessed |> reorderCards Id

let oneAwayorNot(cards:Card list):Card list=                    //koristi se za popup, ako su 3 od 4 karte iste kategorije setovat cemo popup na true 
   let selectCard = List.filter (fun x -> x.selected) cards 
   let selectId = List.map (fun x-> x.id) selectCard
   let check= selectCard |> List.exists (fun x -> (List.filter (fun y -> y=x.id) selectId) |> List.length = 3)
   if check then 
     List.map (fun x -> {x with popup=true}) cards 
   else 
    cards

let stopAnimating(cards:Card list):Card list=                   //funkcija koja se koristi da se prestane sa ogranicenjem dispatch-ovanja i eventualno ako se desio shuffle da flag postavi na false
  List.map (fun x -> {x with animating=false;shuffle=false}) cards

//--------------------------------------------------------------------------------------------------------------------------------------------
                                (*   u p d a t e    f u n c t i o n   *)
//--------------------------------------------------------------------------------------------------------------------------------------------
let update (msg:Message) (state:State):State*Cmd<'Msg> =
   match state with 
   | Initial gm -> 
      match msg with 
      | TileClick card ->  
         let newCards = selectCard card gm.cardsToGuess                 
         if countSelected newCards < 4 then 
            Initial {gm with cardsToGuess = newCards},Cmd.none
         else
           let isMatch = checkMatchingCards newCards           
           if isMatch then 
            let selectedId= (List.find (fun x -> x.selected) newCards).id
            let updatedCards = markGuessedCards newCards |> reorderCards selectedId |> setAnimating
            let waitsec()= 
               async{
                  do! Async.Sleep 1000
                  printfn "Delayed switching cards!"
            }
            let cmdfoo()=Transformed
            InitialGuess({cardsToGuess=updatedCards}, 0), Cmd.OfAsync.perform waitsec () cmdfoo
           else 
            let waitsec()=async{
               do! Async.Sleep 1500
               printfn "Delayed shaking"
            }
            InitialGuess({gm with cardsToGuess= (newCards |> setAnimating)},0), Cmd.OfAsync.perform waitsec ()(fun ()-> Shake)   
      | DeselectAll ->      
        let newCards=gm.cardsToGuess |>  deselectCards 
        Initial {gm with cardsToGuess=newCards},Cmd.none
      |ShuffleCards -> 
        let newCards = gm.cardsToGuess |> shuffleCards |> setAnimating
        let waitsec()=async{
               do! Async.Sleep 1000
               printfn "Delayed shuffling"
            }
        Initial{gm with cardsToGuess=newCards},Cmd.OfAsync.perform waitsec () (fun _ -> StopAnimating)
      |StopAnimating -> 
        let newCards = gm.cardsToGuess |> stopAnimating
        Initial{gm with cardsToGuess=newCards},Cmd.none
      |PlayAgain -> init()
      |_-> state,Cmd.none   
   
   | InitialGuess(gm,cnt) -> 
      match msg with 
      |Shake ->    
         let Cards = gm.cardsToGuess |> shakeCards 
         let newCards = 
          if cnt<>3 then 
           Cards |>  oneAwayorNot |>  deselectCards 
          else 
           Cards |> deselectCards
         let waitsec()=async{
               do! Async.Sleep 1500
               printfn "Delayed unshaking"
            }
         let cmdfoo() =StopShake
         if cnt+1<>4 then 
          InitialGuess({gm with cardsToGuess=newCards},cnt+1),Cmd.OfAsync.perform waitsec () cmdfoo
         else
           let cmdfoo() = ShowResult
           GameOver({gm with cardsToGuess=newCards |> setAnimating}),Cmd.OfAsync.perform waitsec () cmdfoo 
      |Transformed -> 
         let newCards = (gm.cardsToGuess |> transformCards) |> deselectCards 
         let waitsec()= 
               async{
                  do! Async.Sleep 1000
                  printfn "Delayed switching cards!"
            }
         InitialGuess({gm with cardsToGuess=newCards},cnt), Cmd.OfAsync.perform waitsec () ( fun _ -> StopAnimating)
      |DeselectAll  -> 
         let newCards=gm.cardsToGuess |> deselectCards 
         InitialGuess ({gm with cardsToGuess=newCards},cnt),Cmd.none
      |StopShake -> 
          let newCards = gm.cardsToGuess |> stopShaking  
          InitialGuess({gm with cardsToGuess=newCards},cnt),Cmd.ofMsg StopAnimating
      |StopAnimating -> 
        let newCards = gm.cardsToGuess |> stopAnimating
        InitialGuess({gm with cardsToGuess=newCards},cnt),Cmd.none
      |ShuffleCards -> 
        let newCards = gm.cardsToGuess |> shuffleCards |> setAnimating
        let waitsec()=async{
               do! Async.Sleep 1000
               printfn "Delayed shuffling"
            }
        InitialGuess({gm with cardsToGuess=newCards},cnt),Cmd.OfAsync.perform waitsec ()  (fun _-> StopAnimating) 
      |TileClick card -> 
         let newCards = selectCard card gm.cardsToGuess
         if countSelected newCards < 4 then 
            InitialGuess({gm with cardsToGuess = newCards},cnt),Cmd.none
         else
           let isMatch = checkMatchingCards newCards
           if isMatch then 
            let selectedId= (List.find (fun x -> x.selected) newCards).id
            let updatedCards = markGuessedCards newCards |> reorderCards selectedId |> setAnimating
            let waitsec()= 
               async{
                  do! Async.Sleep 1000
                  printfn "Delayed switching cards!"
            }
            let cmdfoo()=Transformed
            InitialGuess({cardsToGuess=updatedCards}, cnt), Cmd.OfAsync.perform waitsec () cmdfoo
           else
           let waitsec()=
              async{
                do! Async.Sleep 1500
                printfn "Delayed shaking" 
            }
           let cmdfoo() = Shake
           InitialGuess({gm with cardsToGuess=newCards |> setAnimating},cnt), Cmd.OfAsync.perform waitsec () cmdfoo 
       |PlayAgain -> init()
       |_->state,Cmd.none
   
   |GameOver gm -> 
      match msg with 
       | ShowResult -> 
          let newCards = gm.cardsToGuess |> stopShaking |> showCards     
          let waitsec()= 
               async{
                  do! Async.Sleep 1000
                  printfn "Delayed text!"
             }
          let cmdfoo()=Transformed
          GameOver {gm with cardsToGuess=newCards}, Cmd.OfAsync.perform waitsec () cmdfoo 
        |Transformed -> 
            let newCards = (gm.cardsToGuess |> transformCards) |>setAnimating |> deselectCards 
            let waitsec()= 
               async{
                  do! Async.Sleep 1000
                  printfn "Delayed show!"
             }
            if List.forall (fun x-> x.istext) newCards then 
              GameOver{gm with cardsToGuess=newCards|>List.map(fun x -> {x with gameOver=true})}, Cmd.OfAsync.perform waitsec () (fun _ -> StopAnimating)
            else 
               GameOver{gm with cardsToGuess= newCards},Cmd.OfAsync.perform waitsec () (fun _ ->ShowResult)
       |StopAnimating -> 
        let newCards = gm.cardsToGuess |> stopAnimating
        GameOver({gm with cardsToGuess=newCards}),Cmd.none
       |PlayAgain -> init()
       |_->state,Cmd.none

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
                                                      (*   r e n d e r    *)    
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------


let render (state: State) (dispatch: Message -> unit) =
  
  let game,cnt= 
    match state with 
    |Initial cards -> cards.cardsToGuess,0
    |InitialGuess (cards, count)-> cards.cardsToGuess,count
    |GameOver cards-> cards.cardsToGuess,4
  

  let renderRow (cards: Card list) =                           // nested function for rendering each row 
    Html.div [
      prop.className "row"  
      prop.children [
          if List.forall (fun x->x.istext) cards then 
           Html.div[
             prop.className "text-container"
             let id=(List.head cards).id
             prop.children[
             Html.div[
             prop.className "text"
             let text =  
               if id=1 then "Animals:\n dog, cat, bird, butterfly"
               elif id=2 then "Fruits: \n pineapple, apple, strawberry, orange"
               elif id=3 then "Sky:\n clouds, storm, sun, rainbow"
               else "Transportation:\n motorcycle, car, boat, airplane"
             prop.style [style.custom ("whiteSpace", "pre-wrap")]  // zelim da mi prikaze u novom redu nabrojane rijeci 
             prop.text text
             ]
            ]
           ]
          else 
           for card in cards do
            Html.img [
             prop.src $"/public/{card.image}"
             prop.alt "Card"
             prop.className ( if card.selected  then "children selected" elif card.shake then "card shake"  elif card.shuffle then "card shuffle" else "children")
             prop.onClick (fun _ -> if card.animating=false then  dispatch (TileClick card)) // Pozivanje TileClick kada se klikne na sliku
          ]
      ]
    ]

  let row1=List.take 4 game
  let row2=List.skip 4 game |> List.take 4
  let row3= List.skip 8 game |> List.take 4
  let row4= List.skip 12 game |> List.take 4
  
  Html.div [
    prop.className "main"
    prop.children [
        
      renderRow row1
      renderRow row2
      renderRow row3
      renderRow row4
       
      Html.div[
        prop.className "btn-container"
        prop.children [
      // Dugme za shuffle
         Html.button [
          prop.text "Shuffle"
          prop.className "btn"
          prop.onClick (fun _ -> if(List.forall (fun x -> x.animating=false) game) then  dispatch ShuffleCards)
         ]
      // Dugme za deselect all
         Html.button [
          prop.className "btn"
          prop.text "Deselect All"
          prop.onClick (fun _ -> if (List.forall (fun x -> x.animating=false) game) then dispatch DeselectAll)
         ]
         Html.button[
           prop.className "btn"
           prop.text "Play again"
           prop.onClick (fun _ -> if (List.forall (fun x -> x.animating=false) game) then dispatch PlayAgain)
         ]
       ]
      ] 
      Html.div[ 
           prop.text $"Remaining attempts: "
           prop.className "trys"
      ]
      Html.div[
        prop.children[
           for i in 1..4 do 
            Html.div[ 
            prop.className ( if i>cnt then  "dots notused" else "dots used")
          ] 
        ]
      ]
      if cnt=4 then 
       Html.div[
          prop.text " Game Over :( "
          prop.className "gameover-cnt"
       ]
      if (List.forall (fun x->x.guessed && not x.animating && not x.gameOver) game) then 
         Html.div[
           prop.text "Well done! :) "
           prop.className "done-cnt"
        ]
      if (List.forall (fun x -> x.popup) game) then 
       Html.div[
             prop.className "popup"
             prop.text "One away!"
       ] 
      Html.div[
         prop.text "Group photos that share a common thread."
         prop.className "msg"
       ]
    ]
  ]
 //------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- 
Program.mkProgram init update render
|> Program.withReactSynchronous "app"
|> Program.run
