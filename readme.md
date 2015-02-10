This is a static html widget or interactive that makes it easy for students to use [iSENSE](http://isenseproject.org/) within the context of an activity.

Currently this interactive is hard coded to point to a local install of iSENSE. And it is specific to certain
project fields.

Here is a [screencast](http://www.screencast.com/t/7jSfLv7J20y) of this interactive embedded in [ITSI](https://itsi.portal.concord.org).

### Usage Scenario

The basic idea is that a class will be divided into groups.  Each student in a group will have their own computer and will be working through the ITSI activity. The group has only one experiment setup, so all the members of the group need to see all data collected by that group. We want to support students going to iSENSE and exploring the data from all of the classes that are doing this project. However we want a very simple UI for students to enter their data in the activity and see a visualization of it.

### Technical details

- the interactive is iframe'd into the ITSI activity
- the iSENSE visualization is iframe'd into the ITSI activity
- the "Group Name" is a field in the iSENSE project.
- the interactive loads all the datasets, and constructs the visualization URL with just the datasets with a matching group name.

This approach will not work well when we have a hundred classes with 10 groups in each class. In that case there will be group name conflicts.  However that can be fixed without any changes to iSENSE.  I can add a class ID field to the iSENSE project. The ITSI activity knows the students class ID, and can pass this class ID into the interactive. The interactive will then use this class ID to filter the data that matches the group name and class ID.