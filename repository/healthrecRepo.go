package repository

import (
	"appengine"
	"appengine/datastore"
)

type HealthrecRepo struct {
	c appengine.Context
}

func NewHealthrecRepo(c appengine.Context) *HealthrecRepo {
	return &HealthrecRepo{
		c: c,
	}
}

func (repo *HealthrecRepo) GetHealthrec(extId string) (healthrec Healthrec, err error) {
	key, err := datastore.DecodeKey(extId)
	if err != nil {
		repo.c.Errorf("datastore.DecodeKey `%v`.", err)
		return
	}
	err = datastore.Get(repo.c, key, &healthrec)
	if err != nil {
		repo.c.Errorf("datastore.Get `%v`.", err)
		return
	}
	return
}

func (repo *HealthrecRepo) GetAllHealthrecs(patient string) (healthrecs []Healthrec, extIds []string, err error) {

	var q *datastore.Query
	if patient == "" {
		q = datastore.NewQuery("Healthrec").
			Order("-DateAction")
	} else {
		q = datastore.NewQuery("Healthrec").
			Filter("Patient =", patient).
			Order("-DateAction")
	}

	keys, err := q.GetAll(repo.c, &healthrecs)
	if err != nil {
		repo.c.Errorf("q.GetAll `%v`.", err)
		return
	}

	// Convert keys to external ids.
	extIds = make([]string, len(keys))
	for i, key := range keys {
		extIds[i] = key.Encode()
	}

	return
}

func (repo *HealthrecRepo) ModifyHealthrec(healthrec Healthrec, extId string) (err error) {

	key, err := datastore.DecodeKey(extId)
	if err != nil {
		repo.c.Errorf("datastore.DecodeKey `%v`.", err)
		return
	}

	_, err = datastore.Put(repo.c, key, &healthrec)
	if err != nil {
		repo.c.Errorf("datastore.Put `%v`.", err)
		return
	}
	return
}

func (repo *HealthrecRepo) CreateHealthrec(healthrec Healthrec) (newNote Healthrec, extId string, err error) {

	key := datastore.NewIncompleteKey(repo.c, "Healthrec", nil)
	newkey, err := datastore.Put(repo.c, key, &healthrec)
	if err != nil {
		repo.c.Errorf("datastore.Put `%v`.", err)
		return
	}

	return healthrec, newkey.Encode(), nil
}

func (repo *HealthrecRepo) DeleteHealthrec(extId string) (err error) {
	//``TODO Not implemented.

	return
}

func (repo *HealthrecRepo) GetRecordTypes() []string {
	return recordTypes
}
