import csv

# open CSV file in read mode
with open('Attendancedata.csv', 'r') as csvfile:
    # create a CSV reader object
    csvreader = csv.reader(csvfile)

    # get the header row and find the column index to update
    header = next(csvreader)
    col_index = header.index('Attendance')
    col_index2 = header.index('Name')

    # create a list to store the updated rows
    updated_rows = []
    
    # loop through each row in the CSV file
    for row in csvreader:
        # update the value in the desired column
        if row[col_index2] == "UJJWAL_PROFILE":
             row[col_index] = int(row[col_index]) + 1

       

        # add the updated row to the list
        updated_rows.append(row)

# open the same CSV file in write mode to update its contents
with open('Attendancedata.csv', 'w', newline='') as csvfile:
    # create a CSV writer object
    csvwriter = csv.writer(csvfile)

    # write the header row
    csvwriter.writerow(header)

    # write the updated rows
    csvwriter.writerows(updated_rows)

print("Column data has been updated!")
