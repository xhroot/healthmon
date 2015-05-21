package repository

import (
	"time"
)

type Healthrec struct {
	Patient        string    `json:"Patient"`
	RecordType     string    `json:"RecordType"`
	DateAction     time.Time `json:"DateAction"`
	Measurement    string    `json:"Measurement"`
	MedicationName string    `json:"MedicationName"`
	MedicationUrl  string    `json:"MedicationUrl"`
	Symptom        string    `json:"Symptom"`
	Note           string    `json:"Note"`
}

var recordTypes = []string{
	"Symptom",
	"Medication",
	"Temperature",
}
