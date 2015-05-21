package chatlogapp

import (
	"appengine"
	"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"html/template"
	"net/http"
)

type ModelView struct {
	Id    string
	Url   string
	Model interface{}
}

func init() {
	r := mux.NewRouter()
	r.HandleFunc("/", staticHandler("root"))

	// Static Healthmon pages that access the REST endpoints.
	r.HandleFunc("/healthmon/", staticHandler("healthmonHome"))
	r.HandleFunc("/healthmon/detail/", staticHandler("healthmonDetail"))
	r.HandleFunc("/healthmon/detail/{.*}", staticHandler("healthmonDetail"))

	// Healthmon REST endpoints.
	r.HandleFunc("/healthmon/healthrec/", getAllHealthrecs).Methods("GET")
	r.HandleFunc("/healthmon/healthrec/{extId:.+}", getHealthrec).Methods("GET")
	r.HandleFunc("/healthmon/healthrec/", createHealthrec).Methods("POST")
	r.HandleFunc("/healthmon/healthrec/{extId:.+}", editHealthrec).Methods("PUT")
	r.HandleFunc("/healthmon/healthrec/{extId:.+}", deleteHealthrec).Methods("DELETE")

	r.HandleFunc("/healthmon/recordtypes/", getRecordTypes)

	http.Handle("/", r)
}

// Not expecting multi values.
type Qstring struct {
	Key   string
	Value string
}

func staticHandler(page string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {

		c := appengine.NewContext(r)

		qmap := r.URL.Query()
		qstrings := make([]Qstring, len(qmap))
		i := 0
		for k, v := range qmap {
			qstrings[i] = Qstring{
				Key:   k,
				Value: v[0],
			}
			i += 1
		}

		vm := map[string]interface{}{
			"Qstrings": qstrings,
		}
		renderPage(w, c, "view/"+page+".html", vm)
	}
}

func renderJson(w http.ResponseWriter, c appengine.Context, vm interface{}) {
	w.Header().Set("Content-Type", "application/json")
	j, err := json.Marshal(vm)
	if err != nil {
		c.Errorf("json.Marshal: %s", err)
		http.Error(w, "Problem serializing data.", http.StatusInternalServerError)
		return
	}
	fmt.Fprint(w, string(j))
}

// Fuse master with `page`; apply `view` template; render to `w` Response
func renderPage(w http.ResponseWriter, c appengine.Context, page string,
	vm interface{}) {

	funcMap := template.FuncMap{
		"ftoi": func(f float64) int { return int(f) },
	}

	s, err := template.New("master").
		Delims("{{%", "%}}").
		Funcs(funcMap).
		ParseFiles("view/master.html", page)
	if err != nil {
		c.Errorf("template.ParseFiles: %s", err)
		http.Error(w, "There was a problem rendering the page.",
			http.StatusInternalServerError)
		return
	}

	err = s.Execute(w, vm)
	if err != nil {
		c.Errorf("s.Execute: %s", err)
		http.Error(w, "There was a problem rendering the page.",
			http.StatusInternalServerError)
	}
}
