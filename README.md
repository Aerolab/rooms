# Meeting Room Display

![Meeting Room Display](http://i.imgur.com/jBEWBWr.jpg)

This is a side project we built at [Aerolab](https://aerolab.co) to show which meeting rooms are currently available (and for how long), as well as giving you the ability to anonymously book them for 30' with a single tap. This is all based on Google Calendar in a typical Google Apps for Business package.

The motivation behind this is that most meeting room software is needlessly complicated (and expensive!), so we built exactly what we needed as a Web App, which is then deployed to a bunch of cheap Fire HD 8 tablets using a headless web browser. It's simple, it works well to let people know that they shouldn't use a specific meeting room, and it looks kind of cool.


## Setup & Config

This is a standard Node.js project, so you just need to run `npm ci` to install the dependencies and `npm run dev` to start development mode with live reload. Run `npm run build` and then `npm start` to run the app in production mode.

This is the most complicated step, as you are going to need to add two JSON files to make things work: A Google Credentials File, and a list of Meeting Rooms (also known as Resources in Google Calendar).

### Google Credentials

Go to the [Google Developer Console](https://console.developers.google.com/) and create a new Project. After that's done, you need to do a few more things:

* From the Library menu, you need to **Enable the Google Calendar API** (use the search if it's not in the popular list)
* From the Credentials menu, **Create a Service Account**, and select JSON as the key type. Save this file as you'll need it in a while.
* Take note of the **Service Account ID** as well (it looks like accountname@(...).iam.gserviceaccount.com)
* Rename the JSON key file to **rooms-client.json** and place it in the root of the project.

### Configure the supported Meeting Rooms

Go to [Google Calendar](https://calendar.google.com) and click edit on each meeting room calendar. For each one of them do the following:

* On the Calendar Details tab, **Take note of the Calendar ID** (it looks like domain_123@resource.calendar.google.com).
* Under the Share this Calendar, **Share it with the Service Account ID** (add accountname@(...).iam.gserviceaccount.com to the calendar and give it full access)

After you've done that, you need to **Create a rooms.json file** in the root of the project detailing all the enabled rooms, their names and Calendar IDs, using a slug as the key. It should look like this:

```json
{
    "lounge": {"name": "Lounge", "slug": "lounge", "position": "right", "id": "domain_123@resource.calendar.google.com"},
    "super-room": {"name": "Super Room", "slug": "super-room", "position": "left", "id": "domain_456@resource.calendar.google.com"},
}
```

The `position` just shows where the room is located relative to the display. The only options are `left` or `right`.

## Using the app

Open a browser on **http://localhost:3000/room-slug** (not literally, replace room-slug with the proper room key, like *lounge* or *super-room*). You should be able to see the current status of the room and book it.

## Deploying

We provide a Dockerfile, which you can easily use on [Now](https://zeit.co/now), or any other service you prefer. We are not using any sort of authentication or env variables as this is a quick internal project, but you're free to add some sort of auth if you want.

## License

MIT, of course.