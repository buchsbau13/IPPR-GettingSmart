/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * The sample smart contract for documentation topic:
 * Writing Your First Blockchain Application
 */

/*

 TODO: Edit change Functions for multiple Arguments
*/

package main

/* Imports
 * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
 * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
 */
import (
	"bytes"
	"crypto/x509/pkix"
	"encoding/json"
	"errors"
	"fmt"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/lib/cid"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

// ABIContract defines the Smart Contract structure
type ABIContract struct {
}

/*
SemesterPlanEntry describes the structure of one entry in a SemesterPlan.
There can be multiple entries pers weekday
*/
type SemesterPlanEntry struct {
	WorkTimeStart  Duration `json:"worktimestart"`
	WorkTimeEnd    Duration `json:"worktimeend"`
	DriveTimeStart Duration `json:"drivetimestart"`
	DriveTimeEnd   Duration `json:"drivetimeend"`
	Place          string   `json:"place"`
}

/*
ByStartTime allows to sort a list of SemesterPlanEntry by WorkTimeStart
*/
type ByStartTime []SemesterPlanEntry

func timeStringToDuration(timeString string) (time.Duration, error) {
	durationPattern := strings.Replace(timeString, ":", "h", 1) + "m"
	return time.ParseDuration(durationPattern)
}

func (a ByStartTime) Len() int      { return len(a) }
func (a ByStartTime) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a ByStartTime) Less(i, j int) bool {
	return a[i].WorkTimeStart.Duration < a[j].WorkTimeStart.Duration
}

/*
SemesterPlanForRole describes the actual semesterplan (where and how
long to spend working time fore every singly weekday)
There are several roles in every team (eg. "SOKI"), and one plan per Role
*/
type SemesterPlanForRole struct {
	Team string `json:"team"`
	Year string `json:"year"`
	Term string `json:"term"`
	Role string `json:"role"`
	//RoleID                     string              `json:"roleID"`
	//Name                       string              `json:"name"`
	Monday                     []SemesterPlanEntry `json:"monday"`
	Tuesday                    []SemesterPlanEntry `json:"tuesday"`
	Wednesday                  []SemesterPlanEntry `json:"wednesday"`
	Thursday                   []SemesterPlanEntry `json:"thursday"`
	Friday                     []SemesterPlanEntry `json:"friday"`
	PlannedWorkingHoursPerWeek Duration            `json:"plannedWorkingHoursPerWeek"`
	PlannedDrivingTimePerWeek  Duration            `json:"plannedDrivingTimePerWeek"`
}

type SummaryRecord struct {
	Employee      string    `json:"employee"`
	RoleID        string    `json:"identifier"`
	Team          string    `json:"team"`
	Calendarweek  int       `json:"calendarweek"`
	Actdate       time.Time `json:"actdate"`
	Location      string    `json:"location"`
	Arrival       time.Time `json:"arrival"`
	End           time.Time `json:"end"`
	Worktime      Duration  `json:"worktime"`
	PrepInHouse   Duration  `json:"prep_in_house"`
	Comment       string    `json:"comment"`
	SigningPerson string    `json:"signee"`
	TravelTime    Duration  `json:"travelTime"`
}

// WorkProofChartEntry holds the information about one activity
type WorkProofChartEntry struct {
	Calendarweek  int       `json:"calendarweek"`
	Actdate       time.Time `json:"actdate"`
	Location      string    `json:"location"`
	Arrival       time.Time `json:"arrival"`
	End           time.Time `json:"end"`
	Worktime      Duration  `json:"worktime"`
	PrepInHouse   Duration  `json:"prep_in_house"`
	Signature     string    `json:"signature"`
	Comment       string    `json:"comment"`
	SigningPerson string    `json:"signee"`
	TravelTime    Duration  `json:"travelTime"`
	IsTeam        bool      `json:"isTeam"`
}

// WorkProofChart holds all working hours that have been performed during a month
type WorkProofChart struct {
	WPCType             string                `json:"wpctype"`
	Rolename            string                `json:"function"`
	Employee            string                `json:"employee"`
	RoleID              string                `json:"identifier"`
	Month               int                   `json:"month"`
	Year                int                   `json:"year"`
	Team                string                `json:"team"`
	Entries             []WorkProofChartEntry `json:"entries"`
	WorkHoursPerWeek    float64               `json:"workHoursPerWeek"`
	TeamHoursPerWeek    float64               `json:"teamHoursPerWeek"`
	TotalWorkHoursMonth Duration              `json:"totalWorkHoursMonth"`
	TotalPrepHoursMonth Duration              `json:"totalPrepHoursMonth"`
	TotalTeamHoursMonth Duration              `json:"totalTeamHoursMonth"`
	TravelTime          Duration              `json:"travelTime"`
}

// TeamChart represents a list of all Teams
type TeamChart struct {
	Teams []Team `json:"teams"`
}

// Team holds the information about one specific Team
type Team struct {
	Sokis []string `json:"sokis"`
	Psycs []string `json:"psycs"`
	Logos []string `json:"logos"`
	Sprhs []string `json:"sprhs"`
	Physs []string `json:"physs"`
	Motos []string `json:"motos"`
	Ergos []string `json:"ergos"`
	Docts []string `json:"docts"`
}

type UserRoleHistory struct {
	ObjectType string     `json:"docType"`
	Username   string     `json:"username"`
	Roles      []UserRole `json:"roles"`
}

type UserRole struct {
	Role       string    `json:"role"`
	GueltigAb  time.Time `json:"gueltigab"`
	GueltigBis time.Time `json:"gueltigbis"`
}

/*
User represents a collection of additional attributes
that are part of the current user's certificate
*/
type User struct {
	Firstname string
	Lastname  string
	Role      string
	RoleID    string
	Team      string
	MemberOf  []string
	Subject   pkix.Name
}

func (u User) hasGroup(group string) bool {
	for _, a := range u.MemberOf {
		if a == group {
			return true
		}
	}
	return false
}

type ByArrivalTime []WorkProofChartEntry

func (a ByArrivalTime) Len() int      { return len(a) }
func (a ByArrivalTime) Swap(i, j int) { a[i], a[j] = a[j], a[i] }
func (a ByArrivalTime) Less(i, j int) bool {
	return a[i].Arrival.Before(a[j].Arrival)
}

const (
	workProofChartObjectName = "Arbeitszeitnachweis"
	semesterPlanObjectName   = "semesterPlan"
	adminTeam                = "ADMIN"
	adminGroup               = "CN=SOKI_Admin,OU=Blockchain,OU=_Gruppen,OU=Organisation,DC=intra,DC=graz,DC=at"
)

type Duration struct {
	time.Duration
}

func (d Duration) ToHMString() string {
	return fmt.Sprintf("%02d:%02d", int(d.Hours()), int(d.Minutes())%60)
}

func (d Duration) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.ToHMString())
}

func (d *Duration) UnmarshalJSON(b []byte) error {
	var v interface{}
	if err := json.Unmarshal(b, &v); err != nil {
		return err
	}
	switch value := v.(type) {
	case float64:
		d.Duration = time.Duration(value)
		return nil
	case string:
		var err error
		if strings.Contains(value, ":") {
			value = strings.Replace(value, ":", "h", 1) + "m"
		}
		d.Duration, err = time.ParseDuration(value)
		if err != nil {
			return err
		}
		return nil
	default:
		return errors.New("invalid duration")
	}
}

func inTimeSpan(start, end, check time.Time) bool {
	return (check.After(start) && check.Before(end)) || check.Equal(start) || check.Equal(end)
}

func getUser(APIstub shim.ChaincodeStubInterface) (User, error) {
	cID, err := cid.New(APIstub)
	var user User
	if err != nil {
		return user, err
	}
	attributes := []string{}
	attrNames := []string{"firstname", "lastname", "role", "roleID", "team", "memberOf"}
	for _, attrName := range attrNames {
		attrValue, _, _ := cID.GetAttributeValue(attrName)
		attributes = append(attributes, attrValue)
	}
	cert, err := cID.GetX509Certificate()
	subject := pkix.Name{}
	if err == nil {
		subject = cert.Subject
	}
	user = User{attributes[0], attributes[1], attributes[2], attributes[3], attributes[4], strings.Split(attributes[5], ","), subject}
	return user, nil
}

/*
	Helper function to split the string representation of a composite key
	("_elem1_elem2_..._elemN_") into its individual components
*/
func getKeyComponents(objectName string, keyAsString string) []string {
	keyComponents := strings.Split(strings.Trim(keyAsString, "_"), "_")
	if keyComponents[0] == objectName {
		keyComponents = keyComponents[1:]
	}
	return keyComponents
}

func createCompositeKey(APIstub shim.ChaincodeStubInterface, objectName string, keyAsString string) (string, error) {
	keyComponents := getKeyComponents(objectName, keyAsString)
	return APIstub.CreateCompositeKey(objectName, keyComponents)
}

/*
Init the contract
*/
func (s *ABIContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *ABIContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

/*
	Create a new semester plan for a given role within a given team, year and term
*/
func (s *ABIContract) initSemesterPlanForRole(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	var err error
	fmt.Printf("Creating new Semesterplan with these arguments: %s\n", args)
	if len(args) != 4 {
		return shim.Error(`This functions requires the following arguments:
				- team
				- year
				- term
				- roleID
		`)
	}
	zeroDuration, _ := time.ParseDuration("0m")
	team := args[0]
	year := args[1]
	term := args[2]
	role := args[3]

	//roleID := user.RoleID
	//name := user.Firstname + ", " + user.Lastname
	monday := []SemesterPlanEntry{}
	tuesday := []SemesterPlanEntry{}
	wednesday := []SemesterPlanEntry{}
	thursday := []SemesterPlanEntry{}
	friday := []SemesterPlanEntry{}

	//spKey := team+role+term+year
	//Key-Format: "year~team~term~role"
	spKey, err := APIstub.CreateCompositeKey(semesterPlanObjectName, []string{year, team, term, role})
	if err != nil {
		return shim.Error(fmt.Sprintf("Failed to create composite key for: %s, %s, %s, %s", year, team, term, role))
	}
	fmt.Printf("Creating new Semesterplan with key: %s\n", spKey)
	semesterplanAsBytes, err := APIstub.GetState(spKey)
	if err != nil {
		return shim.Error("Failed to get SemesterPlan: " + err.Error())
	} else if semesterplanAsBytes != nil {
		fmt.Println("This Semesterplan already exists: " + spKey)
		return shim.Error("Dieser Semesterplan existiert bereits: " + spKey)
	}

	semesterplan := &SemesterPlanForRole{team, year, term, role,
		//roleID, name,
		monday, tuesday, wednesday, thursday, friday,
		Duration{zeroDuration}, Duration{zeroDuration}}
	semesterplanJSONasBytes, err := json.Marshal(semesterplan)

	if err != nil {
		return shim.Error(err.Error())
	}

	err = APIstub.PutState(spKey, semesterplanJSONasBytes)

	return shim.Success(nil)
}

func (s *ABIContract) addSemesterPlanEntry(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	spKey, err := createCompositeKey(APIstub, semesterPlanObjectName, args[0])
	if err != nil {
		return shim.Error(fmt.Sprintf(`Could convert given key (%s) into a composite key.
		 Make sure that your key is like 'year_team_term_role', separated by '_' : %s`, args[0], err))
	}
	if len(args) != 7 {
		return shim.Error(`This function requires the following seven arguments:
				- key (of form "year_month_roleID", eg. "2018_5_IZB00SK0")
				- weekday as string (eg. "monday")
				- worktimestart ("hh:mm", e.g. "10:35")
				- worktimeend ("hh:mm", eg. "08:30")
				- drivetimestart ("hh:mm", e.g. "10:35")
				- drivetimeend ("hh:mm", eg. "08:30")
				- place (e.g. "Kindergarten 32")
			`)
	}

	weekday := args[1]
	worktimestart, err := time.ParseDuration(strings.Replace(args[2], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error(fmt.Sprintf("Die Anfangszeit (%s) muss eine gültige Zeit sein!", args[2]))
	}
	worktimeend, err := time.ParseDuration(strings.Replace(args[3], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error(fmt.Sprintf("Die Endzeit (%s) muss eine gültige Zeit sein!", args[3]))
	}
	drivetimestart, err := time.ParseDuration(strings.Replace(args[4], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error(fmt.Sprintf("Der Anfang der Fahrzeit (%s) muss eine gültige Zeit sein!", args[4]))
	}
	drivetimeend, err := time.ParseDuration(strings.Replace(args[5], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error(fmt.Sprintf("Das Ende der Fahrzeit (%s) muss eine gültige Zeit sein!", args[5]))
	}
	place := args[6]

	semesterplanEntry := SemesterPlanEntry{
		Duration{worktimestart},
		Duration{worktimeend},
		Duration{drivetimestart},
		Duration{drivetimeend}, place}

	semesterplanAsBytes, err := APIstub.GetState(spKey)
	if err != nil {
		return shim.Error(fmt.Sprintf("Der Semesterplan mit dem Schlüssel '%s' konnte nicht geladen werden: %s", spKey, err.Error()))
	}
	if semesterplanAsBytes == nil || len(semesterplanAsBytes) == 0 {
		return shim.Error(fmt.Sprintf("Der Semesterplan mit dem Schlüssel '%s' existiert noch nicht. Legen Sie zuerst diesen Plan an!", spKey))
	}
	semesterplan := SemesterPlanForRole{}

	json.Unmarshal(semesterplanAsBytes, &semesterplan)
	fmt.Printf("Modifying Plan for %s\n", semesterplan.Team)
	fmt.Printf("Adding %s for %s\n", semesterplanEntry, weekday)
	switch dayswitch := weekday; dayswitch {
	case "monday":
		semesterplan.Monday = append(semesterplan.Monday, semesterplanEntry)
		sort.Sort(ByStartTime(semesterplan.Monday))
	case "tuesday":
		semesterplan.Tuesday = append(semesterplan.Tuesday, semesterplanEntry)
		sort.Sort(ByStartTime(semesterplan.Tuesday))
	case "wednesday":
		semesterplan.Wednesday = append(semesterplan.Wednesday, semesterplanEntry)
		sort.Sort(ByStartTime(semesterplan.Wednesday))
	case "thursday":
		semesterplan.Thursday = append(semesterplan.Thursday, semesterplanEntry)
		sort.Sort(ByStartTime(semesterplan.Thursday))
	case "friday":
		semesterplan.Friday = append(semesterplan.Friday, semesterplanEntry)
		sort.Sort(ByStartTime(semesterplan.Friday))
	default:
		return shim.Error(fmt.Sprintf("\"%s\" is not a valid weekday!", weekday))
	}
	fmt.Println("Update Times for Semesterplan")
	semesterplan.PlannedWorkingHoursPerWeek.Duration =
		semesterplan.PlannedWorkingHoursPerWeek.Duration + worktimeend - worktimestart
	semesterplan.PlannedDrivingTimePerWeek.Duration =
		semesterplan.PlannedDrivingTimePerWeek.Duration + drivetimeend - drivetimestart
	fmt.Printf("Saving updated semester plan: %s\n", semesterplan)
	semesterplanAsBytes, _ = json.Marshal(semesterplan)
	fmt.Printf("Saving updated semester plan: %s with key %s\n", semesterplanAsBytes, spKey)
	err = APIstub.PutState(spKey, semesterplanAsBytes)
	fmt.Println("- end add SemesterPlanEntry")
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(semesterplanAsBytes)
}

/*
  changeSemesterPlanEntry changes one entry in an existing Semesterplan
  Arguments are expected in the following order:
	- the key of the semesterPlan in format ('year_team_role_term')
  - weekday
	- worktimestart
	- worktimeend
	- drivetimestart
	- drivetimeend
	- location
	- index of the enty withing the weekday
*/
func (s *ABIContract) changeSemesterPlanEntry(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 8 {
		return shim.Error(`This function requires the following arguments:
			- key of the semesterPlan in format ('year_team_term_role')
			- weekday
			- worktimestart
			- worktimeend
			- drivetimestart
			- drivetimeend
			- location
			- index of the entry withing the weekday`)
	}
	spKey, err := createCompositeKey(APIstub, semesterPlanObjectName, args[0])
	if err != nil {
		return shim.Error(fmt.Sprintf(`Could convert given key (%s) into a composite key.
		 Make sure that your key is like 'year_team_role_term', separated by '_' : %s`, args[0], err))
	}

	weekday := args[1]
	worktimestart, err := time.ParseDuration(strings.Replace(args[2], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error(fmt.Sprintf("Die Anfangszeit (%s) muss eine gültige Zeit sein!", args[2]))
	}
	worktimeend, err := time.ParseDuration(strings.Replace(args[3], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error(fmt.Sprintf("Die Endzeit (%s) muss eine gültige Zeit sein!", args[3]))
	}
	drivetimestart, err := time.ParseDuration(strings.Replace(args[4], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error(fmt.Sprintf("Der Anfang der Fahrzeit (%s) muss eine gültige Zeit sein!", args[4]))
	}
	drivetimeend, err := time.ParseDuration(strings.Replace(args[5], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error(fmt.Sprintf("Das Ende der Fahrzeit (%s) muss eine gültige Zeit sein!", args[5]))
	}
	place := args[6]
	index, err := strconv.Atoi(args[7])

	if err != nil {
		shim.Error("Der Index muss eine gültige Zahl sein! " + err.Error())
	}

	semesterplanAsBytes, err := APIstub.GetState(spKey)
	if err != nil || semesterplanAsBytes == nil || len(semesterplanAsBytes) == 0 {
		return shim.Error(fmt.Sprintf("Konnte den Semesterplan mit Key '%s' nicht finden. Stellen Sie sicher, dass dieser existiert", spKey))
	}

	semesterplan := SemesterPlanForRole{}

	json.Unmarshal(semesterplanAsBytes, &semesterplan)

	days := map[string]*[]SemesterPlanEntry{
		"monday":    &semesterplan.Monday,
		"tuesday":   &semesterplan.Tuesday,
		"wednesday": &semesterplan.Wednesday,
		"thursday":  &semesterplan.Thursday,
		"friday":    &semesterplan.Friday}

	if index >= len(*days[weekday]) {
		return shim.Error(fmt.Sprintf("Sie möchten den Eintrag an der Stelle %d für %s ändern. Dieser existiert aber nicht!", index, weekday))
	}

	semesterplan.PlannedWorkingHoursPerWeek.Duration =
		semesterplan.PlannedWorkingHoursPerWeek.Duration -
			(*days[weekday])[index].WorkTimeEnd.Duration +
			(*days[weekday])[index].WorkTimeStart.Duration
	semesterplan.PlannedDrivingTimePerWeek.Duration =
		semesterplan.PlannedDrivingTimePerWeek.Duration -
			(*days[weekday])[index].DriveTimeEnd.Duration +
			(*days[weekday])[index].DriveTimeStart.Duration

	(*days[weekday])[index].WorkTimeStart = Duration{worktimestart}
	(*days[weekday])[index].WorkTimeEnd = Duration{worktimeend}
	(*days[weekday])[index].DriveTimeStart = Duration{drivetimestart}
	(*days[weekday])[index].DriveTimeEnd = Duration{drivetimeend}
	(*days[weekday])[index].Place = place
	sort.Sort(ByStartTime(*days[weekday]))

	semesterplan.PlannedWorkingHoursPerWeek.Duration =
		semesterplan.PlannedWorkingHoursPerWeek.Duration + worktimeend - worktimestart
	semesterplan.PlannedDrivingTimePerWeek.Duration =
		semesterplan.PlannedDrivingTimePerWeek.Duration + drivetimeend - drivetimestart

	semesterplanAsBytes, _ = json.Marshal(semesterplan)
	fmt.Println(spKey)
	fmt.Println(string(semesterplanAsBytes))

	APIstub.PutState(spKey, semesterplanAsBytes)

	fmt.Println("- end change SemesterPlanEntry")
	return shim.Success(nil)
}

func (s *ABIContract) deleteSemesterPlan(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	if user.hasGroup(adminGroup) {
		return shim.Error(`Nur Administratoren dürfen Semesterpläne löschen!`)
	}
	if len(args) != 1 {
		return shim.Error(`This function needs the key of the Semesterplan to delete as its only parameter`)
	}
	spKey, err := createCompositeKey(APIstub, semesterPlanObjectName, args[0])
	if err != nil {
		return shim.Error(fmt.Sprintf(`Could convert given key (%s) into a composite key.
		 Make sure that your key is like 'year_team_role_term', separated by '_' : %s`, args[0], err))
	}
	semesterplanAsBytes, err := APIstub.GetState(spKey)
	if err != nil || semesterplanAsBytes == nil {
		return shim.Error(fmt.Sprintf("Konnte den Semesterplan mit Key '%s' nicht finden. Stellen Sie sicher, dass dieser existiert", spKey))
	}
	err = APIstub.DelState(spKey)
	if err != nil {
		fmt.Printf("Konnte den Semesterplan mit Key '%s' nicht löschen: %s", spKey, err.Error())
		return shim.Error(fmt.Sprintf("Konnte den Semesterplan mit Key '%s' nicht löschen: %s", spKey, err.Error()))
	}
	fmt.Println("- end delete SemesterPlan")
	return shim.Success(nil)
}

func (s *ABIContract) deleteSemesterPlanEntry(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error(`This function requires the following arguments:
			- key of the semesterPlan in format ('year_team_term_role')
			- weekday
			- index of the entry withing the weekday`)
	}
	spKey, err := createCompositeKey(APIstub, semesterPlanObjectName, args[0])
	if err != nil {
		return shim.Error(fmt.Sprintf(`Could convert given key (%s) into a composite key.
		 Make sure that your key is like 'year_team_role_term', separated by '_' : %s`, args[0], err))
	}
	weekday := args[1]
	index, err := strconv.Atoi(args[2])
	if err != nil {
		shim.Error("Der Index muss eine gültige Zahl sein! " + err.Error())
	}

	semesterplanAsBytes, err := APIstub.GetState(spKey)
	if err != nil || semesterplanAsBytes == nil {
		return shim.Error(fmt.Sprintf("Konnte den Semesterplan mit Key '%s' nicht finden. Stellen Sie sicher, dass dieser existiert", spKey))
	}
	semesterplan := SemesterPlanForRole{}
	json.Unmarshal(semesterplanAsBytes, &semesterplan)

	days := map[string]*[]SemesterPlanEntry{
		"monday":    &semesterplan.Monday,
		"tuesday":   &semesterplan.Tuesday,
		"wednesday": &semesterplan.Wednesday,
		"thursday":  &semesterplan.Thursday,
		"friday":    &semesterplan.Friday}

	if index >= len(*days[weekday]) {
		return shim.Error(fmt.Sprintf("Sie möchten den Eintrag an der Stelle %d für %s löschen. Dieser existiert aber nicht! (%s)", index, weekday, *days[weekday]))
	}

	semesterplan.PlannedWorkingHoursPerWeek.Duration =
		semesterplan.PlannedWorkingHoursPerWeek.Duration -
			(*days[weekday])[index].WorkTimeEnd.Duration +
			(*days[weekday])[index].WorkTimeStart.Duration
	semesterplan.PlannedDrivingTimePerWeek.Duration =
		semesterplan.PlannedDrivingTimePerWeek.Duration -
			(*days[weekday])[index].DriveTimeEnd.Duration +
			(*days[weekday])[index].DriveTimeStart.Duration

	fmt.Printf("Deleting entry at index %d on %s\n", index, weekday)
	*days[weekday] = append((*days[weekday])[:index], (*days[weekday])[index+1:]...)
	fmt.Println(*days[weekday])
	semesterplanAsBytes, _ = json.Marshal(semesterplan)
	fmt.Println(spKey)
	fmt.Println(string(semesterplanAsBytes))

	APIstub.PutState(spKey, semesterplanAsBytes)

	fmt.Println("- end delete SemesterPlanEntry")
	return shim.Success(nil)
}

func (s *ABIContract) getSemesterPlanByKey(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error(`This function requires the following arguments:
			- key of the semesterPlan in format ('year_team_term_role')`)
	}

	spKey, err := createCompositeKey(APIstub, semesterPlanObjectName, args[0])
	fmt.Printf("Trying find Semesterpan with key: %s\n", spKey)
	fmt.Printf("Error message was: %s\n", err)
	if err != nil {
		return shim.Error(fmt.Sprintf(`Could convert given key (%s) into a composite key.
		 Make sure that your key is like 'year_team_role_term', separated by '_' : %s`, args[0], err))
	}
	fmt.Println("Calling GetState() now!")
	semesterplanAsBytes, err := APIstub.GetState(spKey)
	fmt.Println("finished GetState()!")
	if err != nil || semesterplanAsBytes == nil || len(semesterplanAsBytes) == 0 {
		fmt.Println("It's about time to raise an Error!!!")
		fmt.Println(spKey)
		fmt.Println("Konnte den Semesterplan mit Key nicht finden. Stellen Sie sicher, dass dieser existiert")
		//return shim.Error(fmt.Sprintf("Konnte den Semesterplan mit Key %s' nicht finden. Stellen Sie sicher, dass dieser existiert", spKey))
		return shim.Error("Konnte diesen Semesterplan nicht finden. Stellen Sie sicher, dass dieser existiert")
	}
	fmt.Printf("Error message was: %s\n", err)
	fmt.Printf("Found entry for key %s:\n%s\n", spKey, semesterplanAsBytes)
	fmt.Printf("Length of Result is %d\n", len(semesterplanAsBytes))
	//semesterplan := SemesterPlanForRole{}
	//json.Unmarshal(semesterplanAsBytes, &semesterplan)
	var buffer bytes.Buffer
	buffer.WriteString("{\"Key\":")
	buffer.WriteString("\"")
	buffer.WriteString(spKey)
	buffer.WriteString("\"")

	buffer.WriteString(", \"Record\":")
	// Record is a JSON object, so we write as-is
	buffer.WriteString(string(semesterplanAsBytes))
	buffer.WriteString("}\n")
	return shim.Success(buffer.Bytes())
}

func (s *ABIContract) getSemesterPlansByPartialCompositeKey(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	semesterPlanResultIterator, err := APIstub.GetStateByPartialCompositeKey(semesterPlanObjectName, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	defer semesterPlanResultIterator.Close()
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false

	for semesterPlanResultIterator.HasNext() {
		semesterPlanKV, err := semesterPlanResultIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		fmt.Printf("\nFound SemesterPlan with key=%s und value=%s",
			semesterPlanKV.Key, semesterPlanKV.Value)
		resultAsBytes := semesterPlanKV.Value
		semesterplan := SemesterPlanForRole{}
		json.Unmarshal(resultAsBytes, &semesterplan)
		fmt.Printf("Monday: %s", semesterplan.Monday)
		if resultAsBytes == nil {
			continue
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(semesterPlanKV.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(resultAsBytes))
		buffer.WriteString("}\n")
		bArrayMemberAlreadyWritten = true
	}

	buffer.WriteString("]")

	fmt.Printf("\n- getSemesterPlansByPartialCompositeKey:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

func (s *ABIContract) queryAllSemesterPlansForYear(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error(`This function requires the following two arguments:
				- year
				- team
			`)
	}

	year := args[0]
	team := args[1]

	return s.getSemesterPlansByPartialCompositeKey(APIstub, []string{year, team})
}

func (s *ABIContract) queryAllSemesterPlansForTerm(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error(`This function requires the following three arguments:
				- year
				- team
				- term
			`)
	}
	year := args[0]
	team := args[1]
	term := args[2]
	return s.getSemesterPlansByPartialCompositeKey(APIstub, []string{year, team, term})
}

// WorkProofChart use-case

func (s *ABIContract) initWorkProofChart(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	var err error
	if len(args) != 5 {
		return shim.Error(`This function requires the following arguments:
				- 1. Type (i.e. "IZB")
				- 2. Month (i.e. "5")
				- 3. Year (i.e. "2018")
				- 4. Work hours per Week (i.e. "10.5")
				- 5. Team hours per Week (i.e. "2.0")
				`)
	}

	wpctype := args[0]
	roleName := user.Role
	employee := user.Firstname + ", " + user.Lastname
	roleID := user.RoleID
	month, err := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("2nd argument (month) must be a numeric string")
	}
	year, err := strconv.Atoi(args[2])
	if err != nil {
		return shim.Error("3rd argument (year) must be a numeric string")
	}
	team := user.Team
	workHoursPerWeek, err := strconv.ParseFloat(args[3], 64)
	if err != nil {
		return shim.Error("4th argument (workHoursPerWeek) must be a string of form HH:MM")
	}

	entries := []WorkProofChartEntry{}

	teamHoursPerWeek, err := strconv.ParseFloat(args[4], 64)
	if err != nil {
		return shim.Error("5th argument (teamHoursPerWeek) must be a string of form HH:MM")
	}

	wpcKey, _ := APIstub.CreateCompositeKey(workProofChartObjectName, []string{strconv.Itoa(year),
		strconv.Itoa(month), user.Team, roleID})

	workproofchartAsBytes, err := APIstub.GetState(wpcKey)
	if err != nil {
		return shim.Error(fmt.Sprintf("Fehler bei der Überprüfung, ob dieser Arbeitszeitnachweis (%s) bereits existiert: %s", wpcKey, err.Error()))
	} else if workproofchartAsBytes != nil {
		fmt.Println("This WorkProofChart already exists: " + wpcKey)
		return shim.Error(
			fmt.Sprintf("Ein Arbeitszeitnachweis mit dem Schlüssel '%s' existiert bereits!", wpcKey))
	}
	zeroDuration, _ := time.ParseDuration("0m")
	workproofchart := &WorkProofChart{
		wpctype,
		roleName,
		employee,
		roleID,
		month,
		year,
		team,
		entries,
		workHoursPerWeek,
		teamHoursPerWeek,
		Duration{zeroDuration},
		Duration{zeroDuration},
		Duration{zeroDuration},
		Duration{zeroDuration}}

	workproofchartJSONasBytes, err := json.Marshal(workproofchart)

	if err != nil {
		return shim.Error(err.Error())
	}

	err = APIstub.PutState(wpcKey, workproofchartJSONasBytes)
	if err != nil {
		fmt.Println(err)
		return shim.Error(fmt.Sprintf("Fehler (%s) beim Anlegen eines Arbeitszeitnachweises!", err))
	}
	fmt.Println("- end init WorkProofChart")
	return shim.Success(nil)
}

func (s *ABIContract) getWorkProofChartByKey(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1 (key)")
	}

	key, err := createCompositeKey(APIstub, workProofChartObjectName, args[0])
	if err != nil {
		shim.Error(fmt.Sprintf("Could not create valid composite key from %s, please make sure it has the form \"year_month_roleID\".", args[0]))
	}
	resultAsBytes, _ := APIstub.GetState(key)
	if err != nil {
		shim.Error(fmt.Sprintf("Fehler bei der Suche nach Eintrag %s", key))
	}
	fmt.Printf("This entry has the following length: %d\n", len(resultAsBytes))
	if resultAsBytes == nil || len(resultAsBytes) == 0 {
		return shim.Error(fmt.Sprintf("Konnte Eintrag mit Schlüssel \"%s\" nicht finden!", key))
	}
	var buffer bytes.Buffer
	buffer.WriteString("{\"Key\":")
	buffer.WriteString("\"")
	buffer.WriteString(key)
	buffer.WriteString("\"")

	buffer.WriteString(", \"Record\":")
	// Record is a JSON object, so we write as-is
	buffer.WriteString(string(resultAsBytes))
	buffer.WriteString("}\n")
	return shim.Success(buffer.Bytes())
}

func (s *ABIContract) addWorkProofChartEntry(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	fmt.Printf("addWorkProofChartEntry called with: %s", args)
	var err error
	zone, _ := time.LoadLocation("Europe/Vienna")
	datePattern := "2006-01-02"
	dateTimePattern := "2006-1-2 15:04"
	if len(args) != 12 {
		return shim.Error(`This function requires the following eleven arguments:
				- key (of form "year_month_roleID", eg. "2018_5_IZB00SK0")
				- date ("yyyy-mm-dd", eg. "2018-05-30")
				- location (e.g. "Kindergarten Hartingergasse")
				- arrival time ("hh:mm", eg. "08:30")
				- end time ("hh:mm", eg. "09:20")
				- work hours [hh:mm] (eg. "0.40")
				- preparation time inhouse [hh:mm] (eg. "0.1")
				- signee
				- signature (Base64 encoded image)
				- comment
				- travel time ("hh:mm", eg. "00:35")
				- isTeam (true or false)
			`)
	}
	keyComponents := getKeyComponents(workProofChartObjectName, args[0])
	if len(keyComponents) != 4 {
		return shim.Error("Der Schlüssel für einen Arbeitszeitnachweis besteht aus vier Teilen " +
			"('jahr_monat_team_rolle')!")
	}
	year, err := strconv.Atoi(keyComponents[0])
	if err != nil {
		return shim.Error("1st part of the key must be a valid year (e.g. \"2018\")")
	}
	month, err := strconv.Atoi(keyComponents[1])
	if err != nil {
		return shim.Error("2nd argument must be a valid month as number (e.g. \"11\")")
	}
	team := keyComponents[2]
	roleID := keyComponents[3]
	if team != user.Team || roleID != user.RoleID {
		return shim.Error(fmt.Sprintf("Team (%s/%s) und Rolle (%s/%s) passen nicht zusammen!",
			team, user.Team, roleID, user.RoleID))
	}
	//roleID := keyComponents[2]
	actdate, err := time.ParseInLocation(datePattern, args[1], zone)
	if err != nil {
		return shim.Error(fmt.Sprintf("2nd argument must be a valid date (yyyy-mm-dd): %s", err))
	}
	if actdate.Year() != year || int(actdate.Month()) != month {
		return shim.Error(
			fmt.Sprintf("Das Datum dieses Eintrags (%s) passt nicht zu diesem Arbeitszeitnachweis (%d/%d)!",
				actdate, month, year))
	}
	location := args[2]
	arrival, err := time.ParseInLocation(dateTimePattern, args[1]+" "+args[3], zone)
	if err != nil {
		return shim.Error(fmt.Sprintf("3rd argument must be a valid time (hh:dd): %s", err))
	}
	end, err := time.ParseInLocation(dateTimePattern, args[1]+" "+args[4], zone)
	if err != nil {
		return shim.Error(fmt.Sprintf("4th argument must be a valid time (hh:dd): %s", err))
	}
	worktime, err := time.ParseDuration(strings.Replace(args[5], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error("4th argument must be a duration of form hh:mm (eg. 0:35)")
	}
	prepInHouse, err := time.ParseDuration(strings.Replace(args[6], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error("5th argument must be a duration of form hh:mm (eg. 0:35)")
	}
	signee := args[7]
	signature := args[8]
	comment := args[9]
	travelTime, err := time.ParseDuration(strings.Replace(args[10], ":", "h", 1) + "m")
	if err != nil {
		return shim.Error("11th argument (traveltime) must be a duration of form hh:mm (eg. 0:35)")
	}
	isTeam, err := strconv.ParseBool(args[11])
	if err != nil {
		return shim.Error("12th argument (isTeam) must be a either true or false")
	}
	if end.Before(arrival.Add(worktime).Add(prepInHouse)) {
		return shim.Error("Arbeits- und Vorbereitungszeit übersteigen die Anwesenheit!")
	}
	_, calendarweek := actdate.ISOWeek()
	wpcKey, _ := APIstub.CreateCompositeKey(workProofChartObjectName, keyComponents)

	workproofchartEntry := WorkProofChartEntry{calendarweek, actdate, location, arrival, end,
		Duration{worktime}, Duration{prepInHouse}, signature, comment, signee, Duration{travelTime}, isTeam}

	workproofchartAsBytes, _ := APIstub.GetState(wpcKey)
	if workproofchartAsBytes == nil {
		return shim.Error(fmt.Sprintf("Ein Arbeitszeitnachweis mit dem Schlüssel '%s' existiert noch nicht!", wpcKey))
	}
	workproofchart := WorkProofChart{}
	json.Unmarshal(workproofchartAsBytes, &workproofchart)
	for _, entry := range workproofchart.Entries {
		if inTimeSpan(entry.Arrival, entry.End, arrival) || inTimeSpan(entry.Arrival, entry.End, end) {
			return shim.Error(fmt.Sprintf("Dieser Eintrag überschneidet sich mit %s von %s bis %s",
				entry.Location, entry.Arrival, entry.End))
		}
	}
	workproofchart.Entries = append(workproofchart.Entries, workproofchartEntry)
	sort.Sort(ByArrivalTime(workproofchart.Entries))
	if isTeam {
		workproofchart.TotalTeamHoursMonth.Duration += worktime
	} else {
		workproofchart.TotalWorkHoursMonth.Duration += worktime
	}
	workproofchart.TotalPrepHoursMonth.Duration += prepInHouse
	workproofchart.TravelTime.Duration += travelTime

	workproofchartAsBytes, _ = json.Marshal(workproofchart)

	APIstub.PutState(wpcKey, workproofchartAsBytes)

	fmt.Println("- end add WorkProofChartEntry")
	return shim.Success(nil)
}

func (s *ABIContract) deleteWorkProofChartEntry(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error(`This function requires the following two arguments:
				- key (of form "year_month_roleID", eg. "2018_5_IZB00SK0")
				- index of the entry to delete (starting with zero)
			`)
	}
	keyComponents := getKeyComponents(workProofChartObjectName, args[0])
	team := keyComponents[2]
	roleID := keyComponents[3]
	if team != user.Team || roleID != user.RoleID {
		return shim.Error(fmt.Sprintf("Team (%s/%s) und Rolle (%s/%s) passen nicht zusammen!",
			team, user.Team, roleID, user.RoleID))
	}
	if len(keyComponents) != 4 {
		return shim.Error("Der Schlüssel für einen Arbeitszeitnachweis besteht aus vier Teilen " +
			"('jahr_monat_team_rolle')!")
	}
	position, err := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error("Der Indes des zu löschenden Eintrags muss eine gültige Zahl sein!")
	}

	wpcKey, err := createCompositeKey(APIstub, workProofChartObjectName, args[0])
	if err != nil {
		return shim.Error("Der Schlüssel für diesen Eintrag konnte aus folgenden Elementen nicht erstellt werden: " + strings.Join(args[:3], ","))
	}
	workproofchartAsBytes, _ := APIstub.GetState(wpcKey)
	if workproofchartAsBytes == nil {
		return shim.Error(fmt.Sprintf("Ein Arbeitszeitnachweis mit dem Schlüssel '%s' existiert noch nicht!", wpcKey))
	}
	workproofchart := WorkProofChart{}
	json.Unmarshal(workproofchartAsBytes, &workproofchart)
	if len(workproofchart.Entries) <= position {
		return shim.Error(fmt.Sprintf("Sie möchten Eintrag %d löschen. Dieser existiert aber nicht, da es nur %d Einträge gibt!",
			position+1, len(workproofchart.Entries)))
	}
	entryToDelete := workproofchart.Entries[position]
	workproofchart.Entries = append(workproofchart.Entries[:position], workproofchart.Entries[position+1:]...)
	if entryToDelete.IsTeam {
		workproofchart.TotalTeamHoursMonth.Duration -= entryToDelete.Worktime.Duration
	} else {
		workproofchart.TotalWorkHoursMonth.Duration -= entryToDelete.Worktime.Duration
	}
	workproofchart.TotalPrepHoursMonth.Duration -= entryToDelete.PrepInHouse.Duration
	workproofchart.TravelTime.Duration -= entryToDelete.TravelTime.Duration
	workproofchartAsBytes, _ = json.Marshal(workproofchart)
	APIstub.PutState(wpcKey, workproofchartAsBytes)
	return shim.Success(workproofchartAsBytes)
}

func (s *ABIContract) queryAllSemesterPlansForUser(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	fmt.Printf("Trying to find all Semesterplans for the current user (%s / %s)\n", user.RoleID, user.Team)
	fmt.Println("Building Query String")
	queryString := fmt.Sprintf(`{"selector": {
			"team" : "%s",
			"role" : "%s",
			"_id": {"$regex": ".%s.+"}
		},
		"fields": ["team","year","term","plannedWorkingHoursPerWeek", "role",
							 "plannedDrivingTimePerWeek"]
		}`, user.Team, user.RoleID, semesterPlanObjectName)
	fmt.Printf("Preparing query with: %s", queryString)
	result, err := s.getQueryResultForQueryString(APIstub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(result)
}

func (s *ABIContract) queryAllSemesterPlans(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	if user.hasGroup(adminGroup) {
		fmt.Printf("Sie müssen zur Gruppe '%s' gehören, um diese Funktion ausführen zu dürfen!", adminGroup)
		return shim.Error(fmt.Sprintf("Sie müssen zur Gruppe '%s' gehören, um diese Funktion ausführen zu dürfen!", adminGroup))
	}
	fmt.Println("Trying to find all WorkProofcharts for the current user")
	if len(args) < 1 || len(args) > 3 {
		fmt.Println("Wrong number of arguments: ")
		fmt.Println(args)
		return shim.Error(`This function requires the following arguments:
			- year [mandatory] (i.e. "2018")
			- term [optional] (i.e. "SS" or "WS")
			- team [optional]`)
	}
	year, err := strconv.Atoi(args[0])
	if err != nil || year == 0 {
		fmt.Println("Year isn't a valid number!")
		shim.Error(fmt.Sprintf("The year (%s) needs to be a valid number!", args[0]))
	}
	fmt.Println("Building Query String")
	queryString := `{"selector": { "year": "` + args[0] + "\",\n"
	if len(args) > 1 {
		queryString += ` "term": "` + args[1] + "\",\n"
	}
	if len(args) > 2 {
		queryString += ` "team": "` + args[2] + "\",\n"
	}
	queryString += `"_id": {"$regex": ".` + semesterPlanObjectName + `.+"}
			},
			"fields": ["team","year","term","plannedWorkingHoursPerWeek", "role",
						 		 "plannedDrivingTimePerWeek"]
			}`
	fmt.Printf("Preparing query with: %s", queryString)
	result, err := s.getQueryResultForQueryString(APIstub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(result)
}

func (s *ABIContract) queryAllWorkProofChartsForYearAdmin(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	fmt.Printf("Trying to find all WorkProofcharts for the entire Year %s", args[0])
	fmt.Printf("User belongs to Team: %s", user.Team)
	if user.hasGroup(adminGroup) {
		fmt.Printf("Sie müssen zur Gruppe '%s' gehören, um diese Funktion ausführen zu dürfen!", adminGroup)
		return shim.Error(fmt.Sprintf("Sie müssen zur Gruppe '%s' gehören, um diese Funktion ausführen zu dürfen!", adminGroup))
	}
	fmt.Printf("User '%s, %s' has proper permissions to run this function!", user.Firstname, user.Lastname)
	if len(args) != 1 {
		fmt.Println("Wrong number of arguments: ")
		fmt.Println(args)
		return shim.Error(`This function requires the following two arguments:
			- year (i.e. "2018")`)
	}
	year, err := strconv.Atoi(args[0])
	if err != nil || year == 0 {
		fmt.Println("Year isn't a valid number!")
		shim.Error(fmt.Sprintf("The year (%s) needs to be a valid number!", args[0]))
	}
	fmt.Println("Building Query String")
	queryString := fmt.Sprintf(`{"selector": {
			"year": %d,
			"_id": {"$regex": ".%s.+"}
			},
			"fields": ["team","year","month","employee","function","identifier",
						 		 "totalWorkHoursMonth","totalPrepHoursMonth",
						 		 "totalTeamHoursMonth","travelTime"]
			}`,
		year, workProofChartObjectName)
	fmt.Printf("Preparing query with: %s", queryString)
	result, err := s.getQueryResultForQueryString(APIstub, queryString)
	if err != nil {
		fmt.Printf("Error during query: %s", err)
		return shim.Error(err.Error())
	}
	return shim.Success(result)
}

func (s *ABIContract) queryAllWorkProofChartsForYear(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	fmt.Println("Trying to find all WorkProofcharts for the current user")
	if len(args) != 1 {
		fmt.Println("Wrong number of arguments: ")
		fmt.Println(args)
		return shim.Error(`This function requires the following two arguments:
			- year (i.e. "2018")`)
	}
	year, err := strconv.Atoi(args[0])
	if err != nil || year == 0 {
		fmt.Println("Year isn't a valid number!")
		shim.Error(fmt.Sprintf("The year (%s) needs to be a valid number!", args[0]))
	}
	fmt.Println("Building Query String")
	queryString := fmt.Sprintf(`{
		"selector": {
				"year": %d,
				"team": "%s",
				"identifier": "%s",
				"_id": {"$regex": ".%s.+"}
		  },
			"fields": ["team","year","month","employee","function",
						 		 "totalWorkHoursMonth","totalPrepHoursMonth",
						 		 "totalTeamHoursMonth","travelTime"]
			,
			"sort": [{"year": "desc"}, {"month": "desc" }]
			}`,
		year, user.Team, user.RoleID, workProofChartObjectName)
	fmt.Printf("Preparing query with: %s", queryString)
	result, err := s.getQueryResultForQueryString(APIstub, queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(result)
}

func (s *ABIContract) queryAllWorkProofChartsForPeriod(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	fmt.Println("Trying to find all WorkProofcharts for the current user")
	if len(args) != 4 {
		fmt.Println("Wrong number of arguments: ")
		fmt.Println(args)
		return shim.Error(`This function requires the following two arguments:
			- start year (i.e. "2018")
			- start month (i.e. "3")
			- end year (i.e "2018")
			- end month (i.e. "6")
			`)
	}
	var numbers [4]int
	for idx, arg := range args {
		var err error
		numbers[idx], err = strconv.Atoi(args[0])
		if err != nil || numbers[idx] <= 0 {
			fmt.Printf("Argument at postion %d (%s) isn't a valid number!\n", idx, arg)
			shim.Error(fmt.Sprintf("Argument at postion %d (%s) isn't a valid number!\n", idx, arg))
		}
	}
	fmt.Println("Building Query String")
	queryString := fmt.Sprintf(`{"selector":
	 {
	   "$or": [
	     {"$and": [{"year": {"$gte":%d}},{"month":{"$gte":%d}}]},
	     {"$and": [{"year": {"$gte":%d}},{"month":{"$lte":%d}}]}
	   ],
	  "_id": {"$regex":"%s.*"}
	 }
	}`,
		numbers[0], numbers[1], numbers[2], numbers[3], workProofChartObjectName)
	fmt.Printf("Preparing query with: %s", queryString)
	resultsIterator, err := APIstub.GetQueryResult(queryString)
	defer resultsIterator.Close()
	if err != nil {
		fmt.Printf("Fehler beim Abfragen der Statistik: %s", err)
		return shim.Error("Fehler beim Abfragen der Statistik")
	}
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			fmt.Printf("Fehler beim Auslesen der Statistik: %s", err)
			return shim.Error("Fehler beim Auslesen der Statistik")
		}

		workproofchart := WorkProofChart{}
		json.Unmarshal(queryResponse.Value, &workproofchart)
		for _, entry := range workproofchart.Entries {
			if bArrayMemberAlreadyWritten {
				buffer.WriteString(",\n")
			}
			summaryRecord := SummaryRecord{
				workproofchart.Employee,
				workproofchart.RoleID,
				workproofchart.Team,
				entry.Calendarweek,
				entry.Actdate,
				entry.Location,
				entry.Arrival,
				entry.End,
				entry.Worktime,
				entry.PrepInHouse,
				entry.Comment,
				entry.SigningPerson,
				entry.TravelTime}
			data, _ := json.Marshal(summaryRecord)
			buffer.WriteString(string(data))
			bArrayMemberAlreadyWritten = true
		}
		buffer.WriteString("]")
	}
	return shim.Success(buffer.Bytes())
}

func (s *ABIContract) getQueryResultForQueryString(stub shim.ChaincodeStubInterface, queryString string) ([]byte, error) {
	fmt.Printf("- getQueryResultForQueryString queryString:\n%s\n", queryString)
	resultsIterator, err := stub.GetQueryResult(queryString)
	defer resultsIterator.Close()
	if err != nil {
		return nil, err
	}
	// buffer is a JSON array containing QueryRecords
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse,
			err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")
		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	fmt.Printf("- getQueryResultForQueryString queryResult:\n%s\n", buffer.String())
	return buffer.Bytes(), nil
}

func (s *ABIContract) queryWorkProofChartModsByKey(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 1 {
		return shim.Error("This function requires a key (\"_year_month_roleId\") as an argument!")
	}
	fmt.Printf("About to get key for: %s", args[0])
	key, _ := createCompositeKey(APIstub, workProofChartObjectName, args[0])
	fmt.Printf("About to query history for: %s", key)
	return s.queryModsByKey(APIstub, key)
}

func (s *ABIContract) queryWorkProofChartVersionByKey(APIstub shim.ChaincodeStubInterface, user User, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error("This function requires a key and a Version as an argument!")
	}
	fmt.Printf("About to get key for: %s", args[0])
	key, _ := createCompositeKey(APIstub, workProofChartObjectName, args[0])
	fmt.Printf("About to query history for: %s", key)
	version, err := strconv.Atoi(args[1])
	if err != nil {
		return shim.Error(fmt.Sprintf("Second argument (%s) isn't a valid version!", args[1]))
	}
	historyIer, err := APIstub.GetHistoryForKey(key)
	var buffer bytes.Buffer
	fmt.Println("In Query Version")
	fmt.Println("Key: " + key)
	defer historyIer.Close()
	if err != nil {
		//fmt.Println(err.Error())
		return shim.Error("Error1: " + err.Error())
	}
	i := 0
	for historyIer.HasNext() {
		modification, err := historyIer.Next()
		if err != nil {
			//fmt.Println(err.Error())
			return shim.Error("Error2: " + err.Error())
		}
		// Record is a JSON object, so we write as-is
		if i == version {
			buffer.WriteString(string(modification.Value))
		}
		i++
		// fmt.Println("Returning information about", string(modification.Value))
	}

	return shim.Success(buffer.Bytes())
}

func (s *ABIContract) queryModsByKey(APIstub shim.ChaincodeStubInterface, key string) sc.Response {

	historyIer, err := APIstub.GetHistoryForKey(key)
	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false
	fmt.Println("In Query Modifications")
	fmt.Println("Key: " + key)
	defer historyIer.Close()
	if err != nil {
		//fmt.Println(err.Error())
		return shim.Error("Error1: " + err.Error())
	}
	i := 0
	for historyIer.HasNext() {
		//modification, err := historyIer.Next()
		modification, err := historyIer.Next()
		if err != nil {
			//fmt.Println(err.Error())
			return shim.Error("Error2: " + err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		// Record is a JSON object, so we write as-is
		//buffer.WriteString(string(modification.Value))
		buffer.WriteString(fmt.Sprintf(`{"version": %d, "timestamp" : "%d000"}`,
			i, modification.GetTimestamp().GetSeconds()))
		bArrayMemberAlreadyWritten = true
		i++
		// fmt.Println("Returning information about", string(modification.Value))
	}
	buffer.WriteString("]")

	return shim.Success(buffer.Bytes())
}

/*
Invoke is the Chaincode function that is used by hyperledger to actually
get a function executed
*/
func (s *ABIContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
	// Retrieve the requested Smart Contract function and arguments
	function, args := APIstub.GetFunctionAndParameters()
	user, _ := getUser(APIstub)
	fmt.Printf("Call to %s is made by the following User:\n", function)
	fmt.Println(user)
	fmt.Printf("Organisation: %s\n", user.Subject.Organization)
	fmt.Printf("Unit: %s\n", user.Subject.OrganizationalUnit)
	// Route to the appropriate handler function to interact with the ledger appropriately
	switch function {
	case "initLedger":
		return s.initLedger(APIstub)
	case "initSemesterPlanForRole":
		return s.initSemesterPlanForRole(APIstub, user, args)
	case "addSemesterPlanEntry":
		return s.addSemesterPlanEntry(APIstub, user, args)
	case "changeSemesterPlanEntry":
		return s.changeSemesterPlanEntry(APIstub, args)
	case "queryByKey":
		return s.queryByKey(APIstub, args)
	case "queryAllSemesterPlansForYear":
		return s.queryAllSemesterPlansForYear(APIstub, args)
	case "queryAllSemesterPlans":
		return s.queryAllSemesterPlans(APIstub, user, args)
	case "queryAllSemesterPlansForTerm":
		return s.queryAllSemesterPlansForTerm(APIstub, args)
	case "deleteSemesterPlanEntry":
		return s.deleteSemesterPlanEntry(APIstub, args)
	case "getSemesterPlanByKey":
		return s.getSemesterPlanByKey(APIstub, args)
	case "initWorkProofChart":
		return s.initWorkProofChart(APIstub, user, args)
	case "getWorkProofChartByKey":
		return s.getWorkProofChartByKey(APIstub, args)
	case "addWorkProofChartEntry":
		return s.addWorkProofChartEntry(APIstub, user, args)
	case "deleteWorkProofChartEntry":
		return s.deleteWorkProofChartEntry(APIstub, user, args)
	case "queryAllWorkProofChartsForYear":
		return s.queryAllWorkProofChartsForYear(APIstub, user, args)
	case "queryWorkProofChartModsByKey":
		return s.queryWorkProofChartModsByKey(APIstub, args)
	case "queryAllWorkProofChartsForYearAdmin":
		return s.queryAllWorkProofChartsForYearAdmin(APIstub, user, args)
	case "queryAllWorkProofChartsForPeriod":
		return s.queryAllWorkProofChartsForPeriod(APIstub, user, args)
	case "queryAllSemesterPlansForUser":
		return s.queryAllSemesterPlansForUser(APIstub, user, args)
	case "queryWorkProofChartVersionByKey":
		return s.queryWorkProofChartVersionByKey(APIstub, user, args)
	case "deleteSemesterPlan":
		return s.deleteSemesterPlan(APIstub, user, args)
	default:
		fmt.Println("Request chaincode function not found!")
		return shim.Error("Invalid Smart Contract function name for administrationcontract: " + function)
	}
}

func (s *ABIContract) queryByKey(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	resultAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(resultAsBytes)
}

// The main function is only relevant in unit test mode. Only included here for completeness.
func main() {

	// Create a new Smart Contract
	err := shim.Start(new(ABIContract))
	if err != nil {
		fmt.Printf("Error creating new AdministrationContract: %s", err)
	}
}
