Copy the folder containing the new theme into ./wirecloud_config.
For initialising the new theme, change the line starting with THEME_ACTIVE in
.\wirecloud_config\settings.py to your theme name. Do the same for the line in
.\docker-compose.yml which contains the folder name of the current theme
("graziotthemev2" in our case) and restart the Wirecloud instance.
Finally, execute the following command while Wirecloud is running:

docker-compose exec wirecloud manage.py collectstatic