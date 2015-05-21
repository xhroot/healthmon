package chatlogapp

import (
	"appengine"
	"encoding/json"
	"github.com/gorilla/mux"
	"io/ioutil"
	"net/http"
	"repository"
)

func getAllHealthrecs(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	repo := repository.NewHealthrecRepo(c)

	patient := r.FormValue("patient")

	healthrecs, extIds, err := repo.GetAllHealthrecs(patient)

	if err != nil {
		c.Errorf("repo.GetAllHealthrecs `%v`.", err)
		vm := map[string]interface{}{
			"error": "There was a problem fetching health records.",
		}
		renderJson(w, c, vm)
		return
	}

	// Wrap healthrecs in ModelViews.
	modelViews := make([]ModelView, len(healthrecs))
	for i, h := range healthrecs {
		modelViews[i] = ModelView{
			Id:    extIds[i],
			Url:   r.URL.Path + extIds[i],
			Model: h,
		}
	}

	vm := map[string]interface{}{
		"result": modelViews,
	}

	renderJson(w, c, vm)
}

func getHealthrec(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	vars := mux.Vars(r)
	extId := vars["extId"]

	repo := repository.NewHealthrecRepo(c)
	healthrec, err := repo.GetHealthrec(extId)
	if err != nil {
		c.Errorf("repo.GetHealthrec `%v`.", err)
		vm := map[string]interface{}{
			"error": "There was a problem fetching this health record.",
		}
		renderJson(w, c, vm)
		return
	}

	// Wrap healthrec in ModelView.
	healthrecView := ModelView{
		Id:    extId,
		Url:   r.URL.Path + extId,
		Model: healthrec,
	}

	vm := map[string]interface{}{
		"result": healthrecView,
	}

	renderJson(w, c, vm)
}

func createHealthrec(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	healthrec, err := extractHealthrecFromBody(r, c)
	if err != nil {
		return
	}

	// Create new healthrec record.
	repo := repository.NewHealthrecRepo(c)
	newHealthrec, extId, err := repo.CreateHealthrec(healthrec)
	if err != nil {
		c.Errorf("repo.CreateHealthrec `%v`.", err)
		vm := map[string]interface{}{
			"error": "There was a problem adding a new health record.",
		}
		renderJson(w, c, vm)
		return
	}

	healthrecView := ModelView{
		Id:    extId,
		Url:   r.URL.Path + extId,
		Model: newHealthrec,
	}

	vm := map[string]interface{}{
		"result": healthrecView,
	}

	renderJson(w, c, vm)
}

func editHealthrec(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)

	healthrec, err := extractHealthrecFromBody(r, c)
	if err != nil {
		return
	}

	vars := mux.Vars(r)
	extId := vars["extId"]

	repo := repository.NewHealthrecRepo(c)
	err = repo.ModifyHealthrec(healthrec, extId)
	if err != nil {
		c.Errorf("repo.ModifyHealthrec `%v`.", err)
		vm := map[string]interface{}{
			"error": "There was a problem saving changes to this health record.",
		}
		renderJson(w, c, vm)
		return
	}

	healthrecView := ModelView{
		Id:    extId,
		Url:   r.URL.Path + extId,
		Model: healthrec,
	}

	vm := map[string]interface{}{
		"result": healthrecView,
	}

	renderJson(w, c, vm)
}

func extractHealthrecFromBody(r *http.Request, c appengine.Context) (healthrec repository.Healthrec, err error) {
	// Extract payload from body.
	defer r.Body.Close()
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		c.Errorf("ioutil.ReadAll `%v`.", err)
		return
	}
	err = json.Unmarshal(body, &healthrec)
	if err != nil {
		c.Errorf("json.Unmarshal`%v`.", err)
		return
	}
	return
}

func deleteHealthrec(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	c.Errorf("Not implemented")
	http.Error(w, "Problem executing delete.", http.StatusInternalServerError)
}

func getRecordTypes(w http.ResponseWriter, r *http.Request) {
	c := appengine.NewContext(r)
	repo := repository.NewHealthrecRepo(c)
	recordTypes := repo.GetRecordTypes()
	vm := map[string]interface{}{
		"result": recordTypes,
	}
	renderJson(w, c, vm)
}
