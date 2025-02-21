open Elmish.React
open Elmish
open Feliz

type Operacija =
    | Add
    | Sub
    | Mul
    | Div

type Poruka =
    | Broj of char
    | Jednako
    | Clear
    | Operator of Operacija

type State =
    | UnosimPrviBroj of string
    | UnioOperator of string*Operacija 
    | UnioDrugiBroj of string*Operacija*string

let init () : State = UnosimPrviBroj ""

let calculate (broj1:string) (broj2:string) (op:Operacija)=
   match op with 
   |Add -> 
      if broj1="NaN" then UnosimPrviBroj("NaN")
      elif broj1.Length>10 && (int64 broj1>0L) then UnosimPrviBroj(broj1)  
      elif broj1.Length>11 && (int64 broj1<0L) then UnosimPrviBroj(broj1) 
      else UnosimPrviBroj((int64 broj1 + int64 broj2)|>string)
   |Sub -> 
     if broj1="NaN" then UnosimPrviBroj("NaN")
     elif broj1.Length>10 && (int64 broj1>0L) then UnosimPrviBroj(broj1)  
     elif broj1.Length>11 && (int64 broj1<0L) then UnosimPrviBroj(broj1) 
     else UnosimPrviBroj(string(int64 broj1 - int64 broj2))
   |Mul ->     
        if broj1="NaN" then UnosimPrviBroj("NaN")
        elif broj1.Length>10 && (int64 broj1>0L) then UnosimPrviBroj(broj1)  
        elif broj1.Length>11 && (int64 broj1<0L) then UnosimPrviBroj(broj1) 
        else UnosimPrviBroj(string (int64 broj1* int64 broj2)) 
   |Div ->  
      if int64 broj2=0L then UnosimPrviBroj("NaN")
      elif broj1="NaN" then UnosimPrviBroj("NaN")
      elif broj1.Length>10 && (int64 broj1>0L) then UnosimPrviBroj(broj1)  
      elif broj1.Length>11 && (int64 broj1<0L) then UnosimPrviBroj(broj1) 
      else UnosimPrviBroj(string(int64 broj1 /int64 broj2))


let update (msg: Poruka) (state: State) : State =
    match msg with
    | Broj(c) -> 
       match state with 
       |UnosimPrviBroj (broj) ->
          if broj.Length=10 || broj="NaN" then state 
          else UnosimPrviBroj(broj+string c)
       |UnioOperator(broj,op) -> UnioDrugiBroj(broj,op,string c)
       |UnioDrugiBroj(broj1,op,broj2) -> 
          if broj2.Length=10 then state else UnioDrugiBroj(broj1,op,broj2+string c)
    | Operator(op) -> 
       match state with
       |UnosimPrviBroj(broj) when broj<>"" ->UnioOperator(broj,op) 
       |UnosimPrviBroj(_) -> state
       |UnioOperator(broj,_)-> UnioOperator(broj,op)
       |UnioDrugiBroj(_,_,_)->state
    |Jednako ->
       match state with
       | UnosimPrviBroj(_) -> state
       | UnioOperator(_,_) -> state 
       | UnioDrugiBroj(broj1,op,broj2) -> calculate broj1 broj2 op 
    |Clear -> init()



let render (state: State) (dispatch: (Poruka -> unit)) =
   let display= 
     match state with 
     |UnosimPrviBroj(broj) ->
        if broj.Length>10 && (broj|>int64>0L) then "+inf" 
        elif broj.Length>11 && (broj|>int64<0L) then "-inf" 
        else broj
     |UnioOperator(broj,op)->
       let broj_disp = 
         if broj.Length>10 && (broj|>int64>0L) then "+inf" 
         elif broj.Length>11 && (broj|>int64<0L) then "-inf" 
         else broj
       match op with 
       |Add-> broj_disp+ "+"
       |Sub -> broj_disp + "-"
       |Mul -> broj_disp + "*"
       |Div -> broj_disp + "/"
     |UnioDrugiBroj(broj,op,broj2) ->
        let broj_disp = 
         if broj.Length>10 && (broj|>int64>0L) then "+inf" 
         elif broj.Length>11 && (broj|>int64<0L) then "-inf" 
         else broj
        match op with 
        |Add -> broj_disp + "+" + broj2
        |Sub -> broj_disp + "-" + broj2
        |Mul -> broj_disp + "*" + broj2
        |Div-> broj_disp + "/" + broj2
   

   Html.div [
        Html.div [
            prop.text display
            prop.className "btn-disp"
        ]
        Html.div [
            Html.button [
                prop.className "broj-btn"
                prop.text "1"
                prop.onClick (fun _ -> dispatch (Broj '1'))
            ]
            Html.button [
                prop.className "broj-btn"
                prop.text "2"
                prop.onClick (fun _ -> dispatch (Broj '2'))
            ]
            Html.button [
                prop.className "broj-btn"
                prop.text "3"
                prop.onClick (fun _ -> dispatch (Broj '3'))
            ]
            Html.button [
                prop.className "op-btn"
                prop.text "+"
                prop.onClick (fun _ -> dispatch (Operator Add))
            ]
        ]
        
        Html.div [
            Html.button [
                prop.className "broj-btn"
                prop.text "4"
                prop.onClick (fun _ -> dispatch (Broj '4'))
            ]
            Html.button [
                prop.className "broj-btn"
                prop.text "5"
                prop.onClick (fun _ -> dispatch (Broj '5'))
            ]
            Html.button [
                prop.className "broj-btn"
                prop.text "6"
                prop.onClick (fun _ -> dispatch (Broj '6'))
            ]
            Html.button [
                prop.className "op-btn"
                prop.text "-"
                prop.onClick (fun _ -> dispatch (Operator Sub))
            ]

        ]
        
        Html.div [
            Html.button [
                prop.className "broj-btn"
                prop.text "7"
                prop.onClick (fun _ -> dispatch (Broj '7'))
            ]
            Html.button [
                prop.className "broj-btn"
                prop.text "8"
                prop.onClick (fun _ -> dispatch (Broj '8'))
            ]
            Html.button [
                prop.className "broj-btn"
                prop.text "9"
                prop.onClick (fun _ -> dispatch (Broj '9'))
            ]
            Html.button [
                prop.className "op-btn"
                prop.text "*"
                prop.onClick (fun _ -> dispatch (Operator Mul))
            ]
        ]

        Html.div [
            Html.button [
                prop.className "clr-btn"
                prop.text "CE"
                prop.onClick (fun _ -> dispatch Clear)
            ]

            Html.button [
                prop.className "broj-btn"
                prop.text "0"
                prop.onClick (fun _ -> dispatch (Broj '0'))
            ]
            Html.button [
                prop.className "eq-btn"
                prop.text "="
                prop.onClick (fun _ -> dispatch Jednako)
            ]
            Html.button [
                prop.className "op-btn"
                prop.text "/"
                prop.onClick (fun _ -> dispatch (Operator Div))
            ]
        ]
    ]

      
Program.mkSimple init update render
|> Program.withReactSynchronous "app"
|> Program.run
  




