with open(".env") as env, open(".env.preset", 'w') as preset:
    config = env.readline()
    while config:
        if config.startswith("#"):
            preset.write(config)
        else:
            preset.write("{}\n".format(config[:config.find("=")+1]))
        config = env.readline()
