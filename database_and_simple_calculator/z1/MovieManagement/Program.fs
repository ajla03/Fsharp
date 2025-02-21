open DatabaseAPI
open Microsoft.Data.Sqlite

type Film(db: Database,Id:string, Title: string, Genre: string,ReleaseYear:int,Rating:float) =
    inherit DatabaseEntity(db)

    member this.Title = Title
    member this.Genre = Genre
    member this.Rating=Rating
    member this.ReleaseYear=ReleaseYear
    member this.Id=Id

    override this.BindCommitParameters(cmd: SqliteCommand) : unit =
        cmd.Parameters.AddWithValue("@Title", this.Title) |> ignore
        cmd.Parameters.AddWithValue("@Genre", this.Genre) |> ignore
        cmd.Parameters.AddWithValue("@Rating", this.Rating) |> ignore
        cmd.Parameters.AddWithValue("@ReleaseYear", this.ReleaseYear) |> ignore
        cmd.Parameters.AddWithValue("@Id",this.Id) |> ignore
        ()

    interface ISaveable with
        member this.Save() : unit =
            let insertQuery = "INSERT OR REPLACE INTO Film VALUES (@Id,@Title, @Genre,@ReleaseYear,@Rating);" //za izmjenu i dodavanje filma(izmjena na osnovu id-a)
            this.Commit(insertQuery)
    
    new(db_:Database,id_:string) = Film(db_,id_,"","",0,0.) 

    member this.Delete() = 
       let deleteQuerty="DELETE FROM Film WHERE Id=@Id"
       this.Commit(deleteQuerty)

type FilmBy(title: string,genre:string,rating:float) =
    let mutable _title: string = title
    let mutable _genre: string=genre
    let mutable _rating:float =rating

    member this.Title
        with get () = _title
        and set (title) = _title <- title
     
    member this.Genre
       with get()=_genre
       and set(value)= _genre<-value
    
    member this.Rating 
     with get() = _rating
     and set(value) = _rating<- value

    new() = FilmBy("","",0.)

    interface ISearchable with
        member this.FromReader(reader: SqliteDataReader) : unit = 
          this.Title <- reader.GetString(0)
          this.Genre <- reader.GetString(1)
          this.Rating <- reader.GetString(2) |> float
          ()

let createTables =
    @"
  CREATE TABLE IF NOT EXISTS Film(
    Id TEXT PRIMARY KEY,
    Title TEXT,
    Genre TEXT,
    ReleaseYear INT,
    Rating FLOAT
  );
"

let selectQuery = "SELECT Title,Genre,Rating FROM Film WHERE Genre = @Genre;"

let db = Database("movies.db", createTables)

let film1 = Film(db,"movie1" ,"Gladiator 2", "Romance",2000,8.7)
let film2 = Film(db,"movie2","Mad Max", "Sci-Fi",1999,8.0)
let film3 = Film(db,"movie3" ,"The Notebook", "Romance",2000,9.3)
let film4 = Film(db,"movie4" ,"Star Trek", "Sci-Fi",1999,8.9)
let film5=  Film(db, "movie5", "Forrest Gump", "Drama", 1994, 8.8)
let film6=  Film(db, "movie6", "Inception", "Sci-Fi", 2010, 8.8)
let saveFilms (films: List<ISaveable>) : unit = films |> List.iter (fun x -> x.Save())

saveFilms [ film1; film2; film3; film4 ;film5;film6]

let dict = System.Collections.Generic.Dictionary<string, obj>()
dict.Add("@Genre", "Sci-Fi")

let sciFis = db.Search<FilmBy>(selectQuery, dict)

printfn "Sci-Fi movies:"

for movie in sciFis do
    printfn "- %s  %s %.2f" movie.Title movie.Genre movie.Rating

//izmjena test 
let film7=Film(db,"movie6","The Matrix","Action",1999,8.7)
saveFilms [film7] 
// delete test
//let del_index =Film(db,"movie1") //izbrisi movie sa id-om movie1
//del_index.Delete()


